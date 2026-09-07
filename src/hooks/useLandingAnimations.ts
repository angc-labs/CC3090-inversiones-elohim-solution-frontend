/**
 * useLandingAnimations
 *
 * Encapsulates all GSAP animations for the DMHub landing page.
 * Uses the official useGSAP() hook from @gsap/react for automatic
 * cleanup on unmount and proper SSR safety (Next.js).
 *
 * Pattern: ScrollTrigger.batch() for stagger-entrance of repeated
 * elements; gsap.timeline() for sequenced hero entrance; gsap.matchMedia()
 * for prefers-reduced-motion accessibility compliance.
 *
 * Skills applied: gsap-core, gsap-scrolltrigger, gsap-react, gsap-timeline
 */

import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once (safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export interface LandingAnimationRefs {
  /** Root container — all scoped selector queries target this node */
  mainRef: RefObject<HTMLDivElement | null>;
  /** Dashboard mockup — 3D parallax tilt on scroll */
  visualRef: RefObject<HTMLDivElement | null>;
  /** Floating orb 1 */
  shapeOrb1Ref: RefObject<HTMLDivElement | null>;
  /** Floating orb 2 */
  shapeOrb2Ref: RefObject<HTMLDivElement | null>;
  /** Rotating cube decoration */
  shapeCube1Ref: RefObject<HTMLDivElement | null>;
  /** Dashed ring decoration */
  shapeRingRef: RefObject<HTMLDivElement | null>;
  /** Outer wrapper that gets pinned for horizontal scroll */
  horizontalSectionRef: RefObject<HTMLDivElement | null>;
  /** Inner flex container that moves horizontally */
  horizontalContainerRef: RefObject<HTMLDivElement | null>;
  /** Gradient progress bar between steps */
  laserBeamRef: RefObject<HTMLDivElement | null>;
  /** Steps section wrapper — used as ScrollTrigger for laser beam */
  stepsContainerRef: RefObject<HTMLDivElement | null>;
  /** Navbar header element — for scroll-activated glass effect */
  navbarRef: RefObject<HTMLElement | null>;
  /** CTA section — for dramatic entrance */
  ctaSectionRef: RefObject<HTMLElement | null>;
  /** Features grid container */
  featuresRef: RefObject<HTMLDivElement | null>;
  /** Social proof / logos bar */
  socialProofRef: RefObject<HTMLDivElement | null>;
}

export function useLandingAnimations(refs: LandingAnimationRefs) {
  const {
    mainRef,
    visualRef,
    shapeOrb1Ref,
    shapeOrb2Ref,
    shapeCube1Ref,
    shapeRingRef,
    horizontalSectionRef,
    horizontalContainerRef,
    laserBeamRef,
    stepsContainerRef,
    navbarRef,
    ctaSectionRef,
    featuresRef,
    socialProofRef,
  } = refs;

  useGSAP(
    () => {
      // ─────────────────────────────────────────────────────────────────────
      // gsap.matchMedia() — respects prefers-reduced-motion (GSAP best practice)
      // ─────────────────────────────────────────────────────────────────────
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { reduceMotion, isDesktop } = context.conditions!;
          const dur = reduceMotion ? 0 : 1; // skip all animations when user prefers

          // ───────────────────────────────────────────────────────────────
          // 1. HERO ENTRANCE — Sequential timeline for first impression
          // ───────────────────────────────────────────────────────────────
          const heroTl = gsap.timeline({
            defaults: { ease: "power3.out", duration: dur * 0.75 },
          });

          // Badge pill first
          heroTl.fromTo(
            ".gsap-hero-badge",
            { autoAlpha: 0, y: -20, scale: 0.85 },
            { autoAlpha: 1, y: 0, scale: 1, duration: dur * 0.6 }
          );

          // Headline chars / words — treat each word as a unit
          heroTl.fromTo(
            ".gsap-hero-title",
            { autoAlpha: 0, y: 50, skewY: 4 },
            {
              autoAlpha: 1,
              y: 0,
              skewY: 0,
              duration: dur * 0.85,
              ease: "expo.out",
            },
            "-=0.35"
          );

          // Subtitle
          heroTl.fromTo(
            ".gsap-hero-subtitle",
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0 },
            "-=0.5"
          );

          // CTA buttons
          heroTl.fromTo(
            ".gsap-hero-cta",
            { autoAlpha: 0, y: 20, scale: 0.95 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              ease: "back.out(1.5)",
            },
            "-=0.4"
          );

          // Dashboard mockup — slides up with slight rotation
          heroTl.fromTo(
            ".gsap-hero-mockup",
            {
              autoAlpha: 0,
              y: 60,
              rotationX: isDesktop ? 18 : 0,
              scale: 0.96,
            },
            {
              autoAlpha: 1,
              y: 0,
              rotationX: 0,
              scale: 1,
              duration: dur * 1,
              ease: "power4.out",
            },
            "-=0.6"
          );

          // ───────────────────────────────────────────────────────────────
          // 2. NAVBAR — Scroll-activated glass elevation
          // ───────────────────────────────────────────────────────────────
          if (navbarRef.current && !reduceMotion) {
            ScrollTrigger.create({
              trigger: document.body,
              start: "top+=80 top",
              onEnter: () => {
                gsap.to(navbarRef.current, {
                  backdropFilter: "blur(24px)",
                  borderBottomColor: "rgba(148,163,184,0.15)",
                  duration: 0.4,
                  ease: "power2.out",
                });
              },
              onLeaveBack: () => {
                gsap.to(navbarRef.current, {
                  backdropFilter: "blur(12px)",
                  borderBottomColor: "rgba(51,65,85,0.6)",
                  duration: 0.4,
                  ease: "power2.out",
                });
              },
            });
          }

          // ───────────────────────────────────────────────────────────────
          // 3. FLOATING BACKGROUND SHAPES — Continuous ambient motion
          // ───────────────────────────────────────────────────────────────
          if (!reduceMotion) {
            if (shapeOrb1Ref.current) {
              gsap.to(shapeOrb1Ref.current, {
                y: "-=35",
                x: "+=22",
                rotation: 200,
                duration: 6.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            }
            if (shapeOrb2Ref.current) {
              gsap.to(shapeOrb2Ref.current, {
                y: "+=45",
                x: "-=28",
                rotation: -220,
                duration: 7.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            }
            if (shapeCube1Ref.current) {
              gsap.to(shapeCube1Ref.current, {
                rotationX: 360,
                rotationY: 360,
                duration: 14,
                repeat: -1,
                ease: "none",
              });
            }
            if (shapeRingRef.current) {
              gsap.to(shapeRingRef.current, {
                rotation: 360,
                scale: 1.12,
                duration: 11,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
              });
            }
          }

          // ───────────────────────────────────────────────────────────────
          // 4. PARALLAX 3D TILT on Dashboard Mockup
          // ───────────────────────────────────────────────────────────────
          if (visualRef.current && isDesktop && !reduceMotion) {
            gsap.to(visualRef.current, {
              rotationX: 8,
              scale: 0.97,
              ease: "none",
              scrollTrigger: {
                trigger: visualRef.current,
                start: "top center",
                end: "bottom top",
                scrub: 1.5,
              },
            });
          }

          // ───────────────────────────────────────────────────────────────
          // 5. SOCIAL PROOF BAR — Fade + slide with stagger
          // ───────────────────────────────────────────────────────────────
          if (socialProofRef.current) {
            ScrollTrigger.batch(".gsap-social-proof-item", {
              start: "top 90%",
              once: true,
              onEnter: (elements) => {
                gsap.fromTo(
                  elements,
                  { autoAlpha: 0, y: 20 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: reduceMotion ? 0 : 0.6,
                    stagger: 0.08,
                    ease: "power2.out",
                  }
                );
              },
            });
          }

          // ───────────────────────────────────────────────────────────────
          // 6. HORIZONTAL SCROLL SHOWCASE
          //    CRITICAL: ease must be "none" for 1:1 scroll-position sync
          // ───────────────────────────────────────────────────────────────
          if (
            horizontalSectionRef.current &&
            horizontalContainerRef.current &&
            !reduceMotion
          ) {
            const totalWidth =
              horizontalContainerRef.current.scrollWidth;
            const viewportWidth = window.innerWidth;
            const travelDistance = totalWidth - viewportWidth;

            const scrollTween = gsap.to(horizontalContainerRef.current, {
              x: () => -travelDistance,
              ease: "none", // REQUIRED — GSAP docs: horizontal containerAnimation must use ease:"none"
              scrollTrigger: {
                trigger: horizontalSectionRef.current,
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => `+=${travelDistance + 300}`,
                invalidateOnRefresh: true,
              },
            });

            // Nested card entrance animations using containerAnimation
            gsap.utils
              .toArray<HTMLElement>(".horizontal-item")
              .forEach((card, i) => {
                gsap.fromTo(
                  card,
                  { autoAlpha: 0, scale: 0.92, y: 30 },
                  {
                    autoAlpha: 1,
                    scale: 1,
                    y: 0,
                    duration: reduceMotion ? 0 : 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                      containerAnimation: scrollTween,
                      trigger: card,
                      start: "left 90%",
                      once: true,
                    },
                  }
                );
              });
          }

          // ───────────────────────────────────────────────────────────────
          // 7. FEATURES GRID — ScrollTrigger.batch for staggered entrance
          // ───────────────────────────────────────────────────────────────
          ScrollTrigger.batch(".gsap-feature-card", {
            interval: 0.06,
            batchMax: 3,
            start: "top 85%",
            once: true,
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                { autoAlpha: 0, y: 50, scale: 0.94 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: reduceMotion ? 0 : 0.75,
                  stagger: 0.1,
                  ease: "power3.out",
                }
              );
            },
          });

          // Section headings across all sections
          ScrollTrigger.batch(".gsap-section-heading", {
            start: "top 85%",
            once: true,
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                { autoAlpha: 0, y: 35, skewY: 2 },
                {
                  autoAlpha: 1,
                  y: 0,
                  skewY: 0,
                  duration: reduceMotion ? 0 : 0.8,
                  stagger: 0.12,
                  ease: "expo.out",
                }
              );
            },
          });

          // ───────────────────────────────────────────────────────────────
          // 8. STEP CARDS — Fun Bounce + Icon spin entrance
          // ───────────────────────────────────────────────────────────────
          gsap.utils.toArray<HTMLElement>(".gsap-step-card").forEach((card) => {
            const icon = card.querySelector(".step-icon");
            const badge = card.querySelector(".step-badge");
            const title = card.querySelector("h4");

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
              defaults: { ease: "power3.out", duration: reduceMotion ? 0 : 0.7 },
            });

            tl.fromTo(
              card,
              { autoAlpha: 0, y: 55, scale: 0.88 },
              { autoAlpha: 1, y: 0, scale: 1, ease: "back.out(1.5)" }
            );

            if (icon && !reduceMotion) {
              tl.fromTo(
                icon,
                { rotation: -180, scale: 0, autoAlpha: 0 },
                {
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.55,
                  ease: "back.out(2.2)",
                },
                "-=0.5"
              );
            }

            if (badge && !reduceMotion) {
              tl.fromTo(
                badge,
                { y: -18, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" },
                "-=0.4"
              );
            }

            if (title && !reduceMotion) {
              tl.fromTo(
                title,
                { autoAlpha: 0, x: -15 },
                { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out" },
                "-=0.3"
              );
            }
          });

          // ───────────────────────────────────────────────────────────────
          // 9. LASER BEAM progress line (Steps connector)
          //    scrub: must use "none" ease for 1:1 mapping with scroll
          // ───────────────────────────────────────────────────────────────
          if (laserBeamRef.current && stepsContainerRef.current) {
            gsap.fromTo(
              laserBeamRef.current,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: stepsContainerRef.current,
                  start: "top 65%",
                  end: "bottom 35%",
                  scrub: reduceMotion ? false : true,
                  toggleActions: reduceMotion
                    ? "play none none none"
                    : undefined,
                },
              }
            );
          }

          // ───────────────────────────────────────────────────────────────
          // 10. RBAC ROLE CARDS — 3D flip entrance with stagger
          // ───────────────────────────────────────────────────────────────
          ScrollTrigger.batch(".gsap-role-card", {
            start: "top 88%",
            interval: 0.08,
            batchMax: 3,
            once: true,
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                {
                  autoAlpha: 0,
                  y: 45,
                  rotationY: (i) => (i % 2 === 0 ? 14 : -14),
                  scale: 0.9,
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  rotationY: 0,
                  scale: 1,
                  duration: reduceMotion ? 0 : 0.85,
                  stagger: 0.12,
                  ease: "power3.out",
                }
              );
            },
          });

          // ───────────────────────────────────────────────────────────────
          // 11. CTA SECTION — Dramatic entrance with glow pulse
          // ───────────────────────────────────────────────────────────────
          if (ctaSectionRef.current) {
            const ctaTl = gsap.timeline({
              scrollTrigger: {
                trigger: ctaSectionRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
              defaults: { ease: "power3.out" },
            });

            ctaTl.fromTo(
              ctaSectionRef.current,
              { autoAlpha: 0, y: 50, scale: 0.95 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: reduceMotion ? 0 : 0.9,
              }
            );

            if (!reduceMotion) {
              ctaTl.fromTo(
                ".gsap-cta-title",
                { autoAlpha: 0, y: 25, skewY: 1 },
                { autoAlpha: 1, y: 0, skewY: 0, duration: 0.7, ease: "expo.out" },
                "-=0.55"
              );
              ctaTl.fromTo(
                ".gsap-cta-subtitle",
                { autoAlpha: 0, y: 15 },
                { autoAlpha: 1, y: 0, duration: 0.6 },
                "-=0.45"
              );
              ctaTl.fromTo(
                ".gsap-cta-buttons",
                { autoAlpha: 0, y: 20 },
                { autoAlpha: 1, y: 0, duration: 0.5 },
                "-=0.3"
              );
              ctaTl.fromTo(
                ".gsap-cta-badge",
                { autoAlpha: 0, scale: 0.85 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  stagger: 0.08,
                  duration: 0.4,
                  ease: "back.out(1.5)",
                },
                "-=0.2"
              );
            }
          }

          // ───────────────────────────────────────────────────────────────
          // 12. SIMULATOR SECTION — Slide in from sides
          // ───────────────────────────────────────────────────────────────
          ScrollTrigger.batch(".gsap-simulator-panel", {
            start: "top 85%",
            once: true,
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                { autoAlpha: 0, x: (i) => (i === 0 ? -40 : 40) },
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: reduceMotion ? 0 : 0.85,
                  stagger: 0.1,
                  ease: "power3.out",
                }
              );
            },
          });

          // Cleanup matchMedia — mm.revert() handles all nested animations
          return () => {};
        }
      );

      // mm.revert() is called automatically when scope unmounts (useGSAP cleanup)
    },
    { scope: mainRef }
  );
}
