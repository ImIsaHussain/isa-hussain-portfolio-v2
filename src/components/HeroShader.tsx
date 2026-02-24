"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Pass 1 — liquid gold cloth with mouse-reactive lighting
const goldShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  float fbm(vec2 st) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amp * noise(st);
      st *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 st = vUv * 3.0;
    float t = uTime;

    // Macro drift — slow, large-scale warp that shifts the whole field
    vec2 drift = vec2(
      fbm(vUv * 1.2 + t * 0.04 + vec2(3.1, 7.4)),
      fbm(vUv * 1.2 - t * 0.03 + vec2(6.8, 2.1))
    );
    st += drift * 0.8;

    // Domain warping
    vec2 q = vec2(
      fbm(st + t * 0.15),
      fbm(st + vec2(5.2, 1.3) + t * 0.12)
    );

    vec2 r = vec2(
      fbm(st + 4.0 * q + vec2(1.7, 9.2) + t * 0.10),
      fbm(st + 4.0 * q + vec2(8.3, 2.8) + t * 0.08)
    );

    float n = fbm(st + 4.0 * r);

    // Cloth folds
    float fold1 = sin(st.x * 6.0 + n * 8.0 + t * 0.2) * 0.5 + 0.5;
    float fold2 = sin(st.y * 4.5 + n * 6.0 - t * 0.15) * 0.5 + 0.5;
    float fold3 = sin((st.x + st.y) * 3.0 + n * 5.0 + t * 0.12) * 0.5 + 0.5;

    float folds = fold1 * (0.6 + 0.4 * fold2) * (0.7 + 0.3 * fold3);

    float cloth = mix(n, folds, 0.80);
    cloth += pow(folds, 4.0) * 0.15;

    // Base color
    vec3 darkBase  = vec3(0.047, 0.031, 0.039);
    vec3 deepAmber = vec3(0.30, 0.18, 0.04);
    vec3 gold      = vec3(1.0, 0.635, 0.122);
    vec3 cream     = vec3(0.929, 0.925, 0.910);

    vec3 col = mix(darkBase, deepAmber, smoothstep(0.0, 0.35, cloth));
    col = mix(col, gold, smoothstep(0.35, 0.65, cloth));
    col = mix(col, cream, smoothstep(0.7, 0.95, cloth));

    // Mouse-reactive light — subtle highlight that follows cursor
    float dx = dFdx(cloth);
    float dy = dFdy(cloth);
    vec3 normal = normalize(vec3(-dx * 40.0, -dy * 40.0, 1.0));
    vec3 lightDir = normalize(vec3(uMouse.x - 0.5, uMouse.y - 0.5, 1.0));
    float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0, 0, 1)), 0.0), 24.0);
    col += cream * spec * 0.06;

    // Soft vignette
    float vignette = smoothstep(0.9, 0.2, length(vUv - 0.5));
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Pass 2 — chromatic aberration
const chromaticShader = /* glsl */ `
  precision mediump float;

  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec2 offset = vec2(0.0015);
    vec3 center = texture2D(uTexture, vUv).rgb;
    float rShift = texture2D(uTexture, vUv + offset).r;
    float gShift = texture2D(uTexture, vUv - offset).g;

    float r = mix(center.r, rShift, 0.5);
    float g = gShift;
    float b = center.b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export default function HeroShader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Render target for pass 1
    const renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth * pixelRatio,
      container.clientHeight * pixelRatio
    );

    // Mouse tracking (normalized 0-1, Y flipped for GL)
    const mouse = { x: 0.5, y: 0.5 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Pass 1 — gold shader
    const goldScene = new THREE.Scene();
    const goldUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };
    const goldMaterial = new THREE.ShaderMaterial({
      uniforms: goldUniforms,
      vertexShader,
      fragmentShader: goldShader,
    });
    goldScene.add(new THREE.Mesh(geometry, goldMaterial));

    // Pass 2 — chromatic
    const chromaticScene = new THREE.Scene();
    const chromaticMaterial = new THREE.ShaderMaterial({
      uniforms: { uTexture: { value: renderTarget.texture } },
      vertexShader,
      fragmentShader: chromaticShader,
    });
    chromaticScene.add(new THREE.Mesh(geometry, chromaticMaterial));

    let animationId: number;

    const animate = (time: number) => {
      goldUniforms.uTime.value = time * 0.0001;
      goldUniforms.uMouse.value.set(mouse.x, mouse.y);

      renderer.setRenderTarget(renderTarget);
      renderer.render(goldScene, camera);

      renderer.setRenderTarget(null);
      renderer.render(chromaticScene, camera);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      renderTarget.setSize(w * pixelRatio, h * pixelRatio);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      goldMaterial.dispose();
      chromaticMaterial.dispose();
      geometry.dispose();
      renderTarget.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    />
  );
}
