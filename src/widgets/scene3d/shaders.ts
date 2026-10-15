/** Glass for the orbs: a soft body, a bright rim (fresnel) and one small highlight. No env map needed. */
export const ORB_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const ORB_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uGlow;
  uniform float uDark;
  uniform float uTime;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.4);
    float lift = smoothstep(-0.9, 0.9, n.y + 0.25 * sin(uTime * 0.35 + n.x * 2.6));
    vec3 base = mix(uColorB, uColorA, lift);

    vec3 l = normalize(vec3(-0.45, 0.8, 0.55));
    vec3 h = normalize(l + v);
    float spec = pow(max(dot(n, h), 0.0), 56.0);

    // kept dim on purpose: the shapes sit behind text, which has to stay readable on top of them
    float body = mix(0.14, 0.2, uDark);
    float alpha = (body + rim * (0.36 + 0.2 * uGlow) + spec * 0.2 + uGlow * 0.04) * uAlpha;
    vec3 color = base * (0.7 + 0.28 * rim + 0.35 * uGlow) + vec3(spec) * 0.3;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
