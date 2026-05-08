# Animation Patterns (KB)

- Prefer timeline-based orchestration for multi-step effects.
- Use transform properties for performance (translate/scale/opacity).
- Stagger animations for progressive disclosure where appropriate.

Example snippet (Web Animations API)

```js
const el = document.querySelector('.hero');
el.animate([
  { transform: 'translateY(20px)', opacity: 0 },
  { transform: 'translateY(0)', opacity: 1 }
], { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
```
