function updateYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) yearElement.innerHTML = new Date().getFullYear();
  }

  const clearSidebarActiveStates = () => {
    document.querySelectorAll('.chapter-item').forEach((link) => {
      link.classList.remove('w--current');
    });
  };

  const initGlobalProgressBar = () => {
    const scrollContainer = document.querySelector('.main-outer');
    const progressBar = document.getElementById('pageProgressBar');
    if (!scrollContainer || !progressBar) return;
    let isScrolling = false;
    globalScrollHandler = () => {
      // Throttle to animation frames for 60fps performance
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const scrollTop = scrollContainer.scrollTop;
          const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;

          // Calculate percentage (default to 0 if there's no scrollable area)
          const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

          progressBar.style.width = `${scrollPercent}%`;
          isScrolling = false;
        });
        isScrolling = true;
      }
    };
    scrollContainer.addEventListener('scroll', globalScrollHandler, { passive: true });
    globalScrollHandler();
  };

  const initProgressBar = () => {
    const scrollContainer = document.querySelector('.main-outer');
    if (!scrollContainer) return;
    document.querySelectorAll('.progress-bar').forEach((bar) => {
      bar.style.width = '0%';
    });
    const activeLink = document.querySelector('.title-wrapper.w--current');
    const parentChapter = activeLink?.closest('.chapter');
    const activeProgressBar = parentChapter?.querySelector('.progress-bar');
    if (!activeProgressBar) return;
    let isScrolling = false;
    scrollProgressHandler = () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const scrollTop = scrollContainer.scrollTop;
          const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
          const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 100;
          activeProgressBar.style.width = `${scrollPercent}%`;
          isScrolling = false;
        });
        isScrolling = true;
      }
    };
    scrollContainer.addEventListener('scroll', scrollProgressHandler, { passive: true });
    scrollProgressHandler();
  };

  const initScrollObserver = () => {
    const scrollContainer = document.querySelector('.main-outer');
    const sections = document.querySelectorAll('.chapter-section');
    if (sections.length === 0 || !scrollContainer) return;
    if (sectionObserver) sectionObserver.disconnect();
    const observerOptions = {
      root: scrollContainer,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };
    sectionObserver = new IntersectionObserver((entries) => {
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      if (intersectingEntries.length > 0) {
        clearSidebarActiveStates();
        const allNavLinks = document.querySelectorAll('.chapter-item');
        intersectingEntries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          if (!id) return;
          let foundMatch = false;
          allNavLinks.forEach((link) => {
            if (link.hash === `#${id}`) {
              link.classList.add('w--current');
              foundMatch = true;
            }
          });
          if (!foundMatch) console.warn(`Could not find ANY .chapter-item with a link to #${id}`);
        });
      }
    }, observerOptions);
    sections.forEach((section) => sectionObserver.observe(section));
  };

  function initAccordion() {
    const accordions = document.querySelectorAll('.accordion');
    if (accordionResizeObserver) accordionResizeObserver.disconnect();
    accordionResizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const panel = entry.target;
        const item = panel.parentElement;
        if (item.classList.contains('active')) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      }
    });
    accordions.forEach((accordion) => {
      const headers = accordion.querySelectorAll('.accordion-header');
      const expandBtn = accordion.querySelector('.expand-btn');
      const collapseBtn = accordion.querySelector('.collapse-btn');
      const items = accordion.querySelectorAll('.accordion-item');
      if (headers.length === 0) return;
      headers.forEach((header) => {
        header.onclick = () => {
          const item = header.parentElement;
          const panel = header.nextElementSibling;
          const accordionIcon = item.querySelector('.accordion-icon');

          item.classList.toggle('active');
          const isActive = item.classList.contains('active');

          panel.style.maxHeight = isActive ? panel.scrollHeight + 'px' : null;
          accordionIcon.style.transform = isActive ? 'rotate(45deg)' : 'rotate(0deg)';
          header.setAttribute('aria-expanded', isActive);
        };
      });
      const toggleAll = (activate) => {
        items.forEach((item) => {
          const panel = item.querySelector('.accordion-panel');
          const header = item.querySelector('.accordion-header');
          const accordionIcon = item.querySelector('.accordion-icon');

          if (activate) {
            item.classList.add('active');
            panel.style.maxHeight = panel.scrollHeight + 'px';
          } else {
            item.classList.remove('active');
            panel.style.maxHeight = null;
          }

          accordionIcon.style.transform = activate ? 'rotate(45deg)' : 'rotate(0deg)';
          header.setAttribute('aria-expanded', activate);
        });
      };
      if (expandBtn) expandBtn.onclick = () => toggleAll(true);
      if (collapseBtn) collapseBtn.onclick = () => toggleAll(false);
    });
    document.querySelectorAll('.accordion-panel').forEach((panel) => {
      accordionResizeObserver.observe(panel);
    });
  }

  function initTabs() {
    document.querySelectorAll('.tabs-horizontal').forEach((container) => {
      const buttons = container.querySelectorAll('.tab-button');
      const glider = container.querySelector('.glider');
      const tabMenu = container.querySelector('.tab-menu');
      const counterElement = container.querySelector('.tab-counter');
      const totalStr = String(buttons.length).padStart(2, '0');
      if (counterElement) counterElement.textContent = `01/${totalStr}`;
      if (!tabMenu || !glider) return;
      function moveGlider(activeBtn) {
        glider.style.width = `${activeBtn.offsetWidth}px`;
        glider.style.height = `${activeBtn.offsetHeight}px`;
        glider.style.transform = `translate(${activeBtn.offsetLeft - 4}px, ${activeBtn.offsetTop - 4}px)`;
      }
      if (!container.querySelector('.tab-button.active') && buttons.length) {
        buttons[0].classList.add('active');
        document.querySelector(buttons[0].dataset.target)?.classList.add('active');
      }
      buttons.forEach((button, index) => {
        button.onclick = (e) => {
          buttons.forEach((btn) => btn.classList.remove('active'));
          button.classList.add('active');
          if (counterElement) {
            counterElement.textContent = `${String(index + 1).padStart(2, '0')}/${totalStr}`;
          }
          requestAnimationFrame(() => moveGlider(button));
          const target = document.querySelector(button.dataset.target);
          if (target) {
            container.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
            target.classList.add('active');
          }
        };
      });
      const initialActive = container.querySelector('.tab-button.active');
      if (initialActive) requestAnimationFrame(() => moveGlider(initialActive));
      tabMenu.onclick = (e) => {
        if (window.innerWidth <= 767) {
          e.stopPropagation();
          tabMenu.classList.toggle('is-open');
        }
      };
    });
  }

  function initTabsVertical() {
		document.querySelectorAll('.tabs-vertical').forEach((container) => {
			const buttons = container.querySelectorAll('.tab-button');
			const tabMenu = container.querySelector('.tab-menu-v');
			const counterElement = container.querySelector('.tab-counter');
			const panels = container.querySelectorAll('.tab-panel');
			const wrapper = container.querySelector('.tab-panel-slot-v');
	
			const setMaxHeight = () => {
				let maxHeight = 0;
				panels.forEach((p) => {
					p.style.height = 'auto';
					if (p.scrollHeight > maxHeight) maxHeight = p.scrollHeight;
				});
				
				if (wrapper) {
					// NEW LOGIC: Compare tabMenu height against the panels' maxHeight
					if (tabMenu && tabMenu.offsetHeight > maxHeight) {
						wrapper.style.height = '100%';
					} else {
						wrapper.style.height = `${maxHeight}px`;
					}
				}
			};
	
			setMaxHeight();
			const totalStr = String(buttons.length).padStart(2, '0');
			if (counterElement) counterElement.textContent = `01/${totalStr}`;
			if (!tabMenu) return;
	
			if (!container.querySelector('.tab-button.active') && buttons.length) {
				buttons[0].classList.add('active');
				document.querySelector(buttons[0].dataset.target)?.classList.add('active');
			}
	
			buttons.forEach((button, index) => {
				button.onclick = () => {
					buttons.forEach((btn) => btn.classList.remove('active'));
					button.classList.add('active');
	
					if (counterElement) {
						counterElement.textContent = `${String(index + 1).padStart(2, '0')}/${totalStr}`;
					}
	
					const target = document.querySelector(button.dataset.target);
					if (target) {
						panels.forEach((p) => p.classList.remove('active'));
						target.classList.add('active');
					}
				};
			});
	
			tabMenu.onclick = (e) => {
				if (window.innerWidth <= 767) {
					e.stopPropagation();
					tabMenu.classList.toggle('is-open');
				}
			};
		});
	}

  function initSlider() {
    document.querySelectorAll('.slide').forEach((instance) => {
      const container = instance.querySelector('.slide-content-wrapper');
      const slides = instance.querySelectorAll('.slide-content');
      if (slides.length === 0) return;
      const transitionStr = 'transform 0.5s cubic-bezier(.445, .05, .55, .95), opacity 0.5s cubic-bezier(.445, .05, .55, .95)';
      if (container) {
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.transition = 'height 0.5s cubic-bezier(.445, .05, .55, .95)';
        container.style.touchAction = 'pan-y';
      }
      slides.forEach((slide) => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.transition = transitionStr;
        slide.style.display = 'block';
      });
      const prevBtn = instance.querySelector('.slide-prev-btn');
      const nextBtn = instance.querySelector('.slide-next-btn');
      const counter = instance.querySelector('.slide-counter');
      let currentIndex = 0;
      const updateSlides = () => {
        if (counter) counter.textContent = `${String(currentIndex + 1).padStart(2, '0')}/${String(slides.length).padStart(2, '0')}`;

        slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === currentIndex);

          // Make sure transitions are turned back on when snapping into place
          slide.style.transition = transitionStr;
          slide.style.transform = `translateX(${100 * (index - currentIndex)}%)`;
          slide.style.opacity = index === currentIndex ? '1' : '0';
        });

        if (container) {
          container.style.height = slides[currentIndex].offsetHeight + 'px';
        }

        if (prevBtn) {
          prevBtn.disabled = currentIndex === 0;
          prevBtn.classList.toggle('disabled', currentIndex === 0);
        }
        if (nextBtn) {
          nextBtn.disabled = currentIndex === slides.length - 1;
          nextBtn.classList.toggle('disabled', currentIndex === slides.length - 1);
        }
      };

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateSlides();
          }
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentIndex > 0) {
            currentIndex--;
            updateSlides();
          }
        });
      }

      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      if (container) {
        container.addEventListener(
          'touchstart',
          (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            slides.forEach((slide) => {
              slide.style.transition = 'none';
            });
          },
          { passive: true },
        );

        container.addEventListener(
          'touchmove',
          (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;

            let friction = 1;
            if ((currentIndex === 0 && deltaX > 0) || (currentIndex === slides.length - 1 && deltaX < 0)) {
              friction = 0.25;
            }

            slides.forEach((slide, index) => {
              const basePercent = 100 * (index - currentIndex);
              const pxOffset = deltaX * friction;
              slide.style.transform = `translateX(calc(${basePercent}% + ${pxOffset}px))`;
            });
          },
          { passive: true },
        );

        container.addEventListener('touchend', () => {
          if (!isDragging) return;
          isDragging = false;

          const deltaX = currentX - startX;
          const swipeThreshold = 50; // The user must drag at least 50px to change slides

          if (deltaX > swipeThreshold && currentIndex > 0) {
            currentIndex--; // Swiped right -> go to previous
          } else if (deltaX < -swipeThreshold && currentIndex < slides.length - 1) {
            currentIndex++; // Swiped left -> go to next
          }
          updateSlides();
        });
      }
      updateSlides();
    });
  }

  function handleClosedSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const chaptersSection = document.getElementById('chapters');
    if (!sidebar) return;

    if (window.location.pathname === '/' || window.location.pathname === '/index') {
      sidebar.classList.add('closed');
    } else {
      sidebar.classList.remove('closed');
    }

    if (chaptersSection) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) sidebar.classList.add('closed');
          });
        },
        { threshold: 0.1 },
      ).observe(chaptersSection);
    }
  }

  function initMenuAccordions() {
    document.querySelectorAll('.chapter-title').forEach((title) => {
      title.replaceWith(title.cloneNode(true));
    });

    document.querySelectorAll('.chapter-title').forEach((title) => {
      title.addEventListener('click', function (event) {
        const content = this.nextElementSibling;
        const chevron = this.querySelector('.chevron');
        if (!content) return; // Safety check just in case
        const isClosing = content.style.height && content.style.height !== '0px';
        if (!isClosing) {
          document.querySelectorAll('.chapter-title').forEach((otherTitle) => {
            if (otherTitle !== this) {
              const otherContent = otherTitle.nextElementSibling;
              const otherChevron = otherTitle.querySelector('.chevron');
              if (otherContent && otherContent.style.height && otherContent.style.height !== '0px') {
                otherContent.style.height = otherContent.scrollHeight + 'px';
                otherContent.offsetHeight; // Force reflow
                otherContent.style.height = '0px';
                if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
              }
            }
          });
        }
        if (isClosing) {
          content.style.height = content.scrollHeight + 'px';
          content.offsetHeight; // Force reflow
          content.style.height = '0px';
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
          content.style.height = content.scrollHeight + 'px';
          if (chevron) chevron.style.transform = 'rotate(90deg)';
          content.addEventListener(
            'transitionend',
            function onEnd() {
              if (content.style.height !== '0px') {
                content.style.height = 'auto';
              }
              content.removeEventListener('transitionend', onEnd);
            },
            { once: true },
          );
        }
      });
    });
  }

  // --- LIQUID GLASS MAP & PHYSICS FUNCTIONS ---
  function calculateDisplacementMap1D(gt, bw, sf, ri, s = 128) {
    const e = 1 / ri;
    const r = [];
    for (let i = 0; i < s; i++) {
      const x = i / s;
      const y = sf(x);
      const dx = x < 1 ? 0.0001 : -0.0001;
      const d = (sf(Math.max(0, Math.min(1, x + dx))) - y) / dx;
      const m = Math.sqrt(d * d + 1);
      const n = [-d / m, -1 / m];
      const dt = n[1];
      const k = 1 - e * e * (1 - dt * dt);
      if (k < 0) {
        r.push(0);
      } else {
        const rf = [-(e * dt + Math.sqrt(k)) * n[0], e - (e * dt + Math.sqrt(k)) * n[1]];
        r.push(rf[0] * ((y * bw + gt) / rf[1]));
      }
    }
    return r;
  }

  function calculateDisplacementMap2D(cw, ch, ow, oh, rad, bw, md, pMap) {
    const img = new ImageData(cw, ch);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = 128;
      img.data[i + 1] = 128;
      img.data[i + 3] = 255;
    }
    const rSq = rad * rad;
    const rp1Sq = (rad + 1) ** 2;
    const rmBwSq = Math.max(0, rad - bw) ** 2;
    const wB = ow - rad * 2;
    const hB = oh - rad * 2;
    const oX = (cw - ow) / 2;
    const oY = (ch - oh) / 2;
    for (let y1 = 0; y1 < oh; y1++) {
      for (let x1 = 0; x1 < ow; x1++) {
        const idx = ((oY + y1) * cw + oX + x1) * 4;
        const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - wB : 0;
        const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - hB : 0;
        const dSq = x * x + y * y;
        if (dSq <= rp1Sq && dSq >= rmBwSq) {
          const dist = Math.sqrt(dSq);
          const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
          const bIdx = Math.floor(Math.max(0, Math.min(1, (rad - dist) / bw)) * pMap.length);
          const dVal = pMap[Math.max(0, Math.min(bIdx, pMap.length - 1))] || 0;
          const dX = md > 0 ? (-(dist > 0 ? x / dist : 0) * dVal) / md : 0;
          const dY = md > 0 ? (-(dist > 0 ? y / dist : 0) * dVal) / md : 0;
          img.data[idx] = Math.max(0, Math.min(255, 128 + dX * 127 * op));
          img.data[idx + 1] = Math.max(0, Math.min(255, 128 + dY * 127 * op));
        }
      }
    }
    return img;
  }

  function calculateSpecularHighlight(ow, oh, rad, bw) {
    const img = new ImageData(ow, oh);
    const sVec = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)];
    const rSq = rad * rad;
    const rp1Sq = (rad + 1) ** 2;
    const rmSSq = Math.max(0, (rad - 1.5) ** 2);
    for (let y1 = 0; y1 < oh; y1++) {
      for (let x1 = 0; x1 < ow; x1++) {
        const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - (ow - rad * 2) : 0;
        const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - (oh - rad * 2) : 0;
        const dSq = x * x + y * y;
        if (dSq <= rp1Sq && dSq >= rmSSq) {
          const dist = Math.sqrt(dSq);
          const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
          const dp = Math.abs((dist > 0 ? x / dist : 0) * sVec[0] + (dist > 0 ? -y / dist : 0) * sVec[1]);
          const cf = dp * Math.sqrt(1 - (1 - Math.max(0, Math.min(1, (rad - dist) / 1.5))) ** 2);
          const c = Math.min(255, 255 * cf);
          const idx = (y1 * ow + x1) * 4;
          img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = c;
          img.data[idx + 3] = Math.min(255, c * cf * op);
        }
      }
    }
    return img;
  }

  function imageDataToDataURL(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.getContext('2d').putImageData(img, 0, 0);
    return c.toDataURL();
  }

  let useBackdropFilter = false;

  function detectFeatures() {
    const t = document.createElement('div');
    t.style.backdropFilter = 'url(#test)';
    useBackdropFilter = !!window.chrome && t.style.backdropFilter.includes('url');
    if (useBackdropFilter) document.body.classList.add('use-backdrop-filter');
  }

  function initLensDemo() {
    const gEl = document.getElementById('lensGlassElement'),
      gIn = document.getElementById('lensGlassInner'),
      dA = document.getElementById('lensDemoArea'),
      cIn = document.getElementById('lensCloneInner'),
      lC = document.getElementById('lensContent');
    if (!gEl || !dA || !lC) return;

    gEl.style.width = '240px';
    gEl.style.height = '240px';
    gEl.style.borderRadius = '120px';

    const s = {
      bezelWidth: 30,
      glassThickness: 150,
      refractiveIndex: 1.5,
      refractionScale: 1.5,
      objectWidth: 240,
      objectHeight: 240,
      radius: 120,
      isActive: false,
      velocityX: 0,
      velocityY: 0,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
      isEntering: false,
    };
    const sp = {
      x: new Spring(0, 150, 20),
      y: new Spring(0, 150, 20),
      scale: new Spring(0.85, 400, 25),
      scaleX: new Spring(1, 400, 30),
      scaleY: new Spring(1, 400, 30),
      ox: new Spring(0, 400, 30),
      oy: new Spring(4, 400, 30),
      blur: new Spring(12, 400, 30),
      alpha: new Spring(0.15, 300, 25),
      rb: new Spring(0.8, 300, 18),
    };
    let af = null;

    const pc = calculateDisplacementMap1D(s.glassThickness, s.bezelWidth, SurfaceEquations.convex_squircle, s.refractiveIndex);
    s.md = Math.max(...pc.map(Math.abs));

    document.getElementById('lensDisplacementImage')?.setAttribute('href', imageDataToDataURL(calculateDisplacementMap2D(s.objectWidth, s.objectHeight, s.objectWidth, s.objectHeight, s.radius, s.bezelWidth, s.md || 1, pc)));
    document.getElementById('lensSpecularImage')?.setAttribute('href', imageDataToDataURL(calculateSpecularHighlight(s.objectWidth, s.objectHeight, s.radius, s.bezelWidth)));

    const cloneEl = document.getElementById('lensContentClone');
    if (cloneEl && !useBackdropFilter) cloneEl.style.filter = 'url(#lensLiquidGlassFilter)';

    function updC(currentX, currentY) {
      const aR = dA.getBoundingClientRect();
      if (!cIn) return;
      cIn.style.width = aR.width + 'px';
      cIn.style.height = aR.height + 'px';
      cIn.style.transformOrigin = '0 0';
      const zoom = 1.5;
      const tx = -currentX * zoom + (s.objectWidth / 2) * (1 - zoom);
      const ty = -currentY * zoom + (s.objectHeight / 2) * (1 - zoom);
      cIn.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    }

    function loop() {
      // NEW: Check if the lens has caught up to the mouse
      if (s.isEntering && s.isActive) {
        const dist = Math.hypot(sp.x.target - sp.x.value, sp.y.target - sp.y.value);
        if (dist < 5) {
          s.isEntering = false; // Glide complete, lock 1:1 tracking
        }
      }
      const dt = Math.min(0.032, 1 / 60);
      // sp.scale.setTarget(s.isActive ? 1 : 0.85);
      sp.scale.setTarget(1);
      sp.ox.setTarget(s.isActive ? 4 : 0);
      sp.oy.setTarget(s.isActive ? 16 : 4);
      sp.blur.setTarget(s.isActive ? 24 : 12);
      sp.alpha.setTarget(s.isActive ? 0.22 : 0.15);
      sp.rb.setTarget(s.isActive ? 1 : 0.8);

      const vM = Math.sqrt(s.velocityX ** 2 + s.velocityY ** 2);
      const sq = Math.min(0.15, vM / 3000);

      if (vM > 50 && s.isActive) {
        const vx = s.velocityX / vM,
          vy = s.velocityY / vM;
        sp.scaleX.setTarget(1 + sq * Math.abs(vx) - sq * 0.5 * Math.abs(vy));
        sp.scaleY.setTarget(1 + sq * Math.abs(vy) - sq * 0.5 * Math.abs(vx));
      } else {
        sp.scaleX.setTarget(1);
        sp.scaleY.setTarget(1);
      }

      const cx = sp.x.update(dt),
        cy = sp.y.update(dt);
      const sc = sp.scale.update(dt),
        sx = sp.scaleX.update(dt),
        sy = sp.scaleY.update(dt);
      const ox = sp.ox.update(dt),
        oy = sp.oy.update(dt),
        b = sp.blur.update(dt),
        a = sp.alpha.update(dt);

      gEl.style.left = `${cx}px`;
      gEl.style.top = `${cy}px`;
      gEl.style.transform = `scale(${sc * sx}, ${sc * sy})`;
      gIn.style.boxShadow = `${ox}px ${oy}px ${b}px rgba(0,0,0,${a}), inset ${ox * 0.3}px ${oy * 0.4}px 16px rgba(0,0,0,${a * 0.6}), inset ${-ox * 0.3}px ${-oy * 0.4}px 16px rgba(255,255,255,${a * 0.48})`;

      document.getElementById('lensDisplacementMap')?.setAttribute('scale', s.md * s.refractionScale * sp.rb.update(dt));

      updC(cx, cy);
      s.velocityX *= 0.95;
      s.velocityY *= 0.95;

      if (!(Object.values(sp).every((x) => x.isSettled()) && Math.abs(s.velocityX) < 1 && Math.abs(s.velocityY) < 1)) {
        lensAnimFrame = requestAnimationFrame(loop);
      } else {
        lensAnimFrame = null;
      }
    }

    const centerLens = (instant = false) => {
      const dA_Rect = dA.getBoundingClientRect();
      const lC_Rect = lC.getBoundingClientRect();
      const targetX = lC_Rect.left - dA_Rect.left + lC_Rect.width / 2 - s.objectWidth / 2;
      const targetY = lC_Rect.top - dA_Rect.top + lC_Rect.height / 2 - s.objectHeight / 2;
      sp.x.target = targetX;
      sp.y.target = targetY;
      if (instant) {
        sp.x.value = targetX;
        sp.y.value = targetY;
      }
    };

    dA.addEventListener('mouseenter', (e) => {
      s.isActive = true;
      s.isEntering = true; // Allow the spring to glide

      sp.x.stiffness = 40;
      sp.x.damping = 7;
      sp.y.stiffness = 40;
      sp.y.damping = 7;

      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastTime = performance.now();
      if (!lensAnimFrame) lensAnimFrame = requestAnimationFrame(loop);
    });

    dA.addEventListener('mousemove', (e) => {
      const dA_Rect = dA.getBoundingClientRect();
      const targetX = e.clientX - dA_Rect.left - s.objectWidth / 2;
      const targetY = e.clientY - dA_Rect.top - s.objectHeight / 2;

      sp.x.target = targetX;
      sp.y.target = targetY;

      // Only snap 1:1 if the initial entry glide is finished
      if (!s.isEntering) {
        sp.x.value = targetX;
        sp.y.value = targetY;
        sp.x.velocity = 0;
        sp.y.velocity = 0;
      }

      const cx = e.clientX,
        cy = e.clientY;
      const dt = Math.max(1, performance.now() - s.lastTime) / 1000;
      s.velocityX = (cx - s.lastX) / dt;
      s.velocityY = (cy - s.lastY) / dt;
      s.lastX = cx;
      s.lastY = cy;
      s.lastTime = performance.now();

      if (!lensAnimFrame) lensAnimFrame = requestAnimationFrame(loop);
    });

    dA.addEventListener('mouseleave', () => {
      s.isActive = false;
      s.isEntering = false; // Reset the flag so it glides back to center

      sp.x.stiffness = 40;
      sp.x.damping = 7;
      sp.y.stiffness = 40;
      sp.y.damping = 7;
      centerLens(false);
      if (!lensAnimFrame) lensAnimFrame = requestAnimationFrame(loop);
    });

    if (window.lensResizeHandler) {
		window.removeEventListener('resize', window.lensResizeHandler);
	}
	
	window.lensResizeHandler = () => {
		if (!s.isActive) centerLens(true);
		updC(sp.x.value, sp.y.value);
	};
	
	window.addEventListener('resize', window.lensResizeHandler);

    centerLens(true);
    if (!lensAnimFrame) lensAnimFrame = requestAnimationFrame(loop);
  }

  function buildLiquidGlass() {
    initLensDemo();
  }

  function updateDownloadUI() {
    const dlBtn = document.getElementById('downloadBtn');
    const dlBtnText = document.getElementById('dlBtnText');
    if (!dlBtn) return;

    if (selectedPdfs.length > 0) {
      dlBtn.style.display = 'flex';
      if (dlBtnText) dlBtnText.textContent = `download ${selectedPdfs.length}`;
    } else {
      dlBtn.style.display = 'none';
    }
  }

  function initializeDynamicSVGs() {
    var rawDataNodes = document.querySelectorAll('script.raw-svg-data:not(.initialized)');
    rawDataNodes.forEach(function (dataNode) {
      var wrapperNode = dataNode.previousElementSibling;
      if (wrapperNode && wrapperNode.classList.contains('dynamic-svg-wrapper')) {
        var decoder = document.createElement('textarea');
        decoder.innerHTML = dataNode.innerHTML;
        wrapperNode.innerHTML = decoder.value;
        dataNode.classList.add('initialized');
        var svg = wrapperNode.querySelector('svg');
        var card = wrapperNode.closest('[data-hover-trigger="true"]');
        if (svg && card) {
          setTimeout(function () {
            if (!card.classList.contains('is-selected')) {
              svg.setCurrentTime(0);
              svg.pauseAnimations();
            }
          }, 50);
          card.addEventListener('mouseenter', function () {
            svg.unpauseAnimations();
          });
          card.addEventListener('mouseleave', function () {
            if (!card.classList.contains('is-selected')) {
              svg.pauseAnimations();
              svg.setCurrentTime(0); // Snap back to frame 0
            }
          });
          var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (mutation.attributeName === 'class') {
                const isSelected = card.classList.contains('is-selected');
                const isHovered = card.matches(':hover');
                if (isSelected) {
                  svg.unpauseAnimations();
                } else if (!isSelected && !isHovered) {
                  svg.pauseAnimations();
                  svg.setCurrentTime(0);
                }
              }
            });
          });
          observer.observe(card, { attributes: true });
        } else if (svg) {
          svg.unpauseAnimations();
        }
      }
    });
  }
