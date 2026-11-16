// ========================================================
// 國立自然科學博物館 × 國家衛生研究院
// 《看見你我他牠它：健康一體的行動密碼》特展成果教學平台 - 核心應用邏輯 (app.js)
// 規格遵循「通用訪視成果技能」4+1 標準架構
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 核心狀態管理
  const state = {
    currentMode: 'modeCenter',  // 'modeCenter' | 'modeA' | 'modeB' | 'modeC' | 'modeQR'
    qaSubMode: 'list',          // 'list' | 'drill'
    currentSlideIndex: 1,       // 1 ~ 105
    totalSlides: window.SLIDES_DATA ? window.SLIDES_DATA.length : 105,
    autoPlayTimer: null,
    isAutoPlaying: false,
    fontSize: localStorage.getItem('nmns_pref_font') || 'md',      // 'md' | 'lg' | 'xl'
    theme: localStorage.getItem('nmns_pref_theme') || 'light',     // 'light' | 'dark' | 'green' | 'blue'
    activeQaCategory: 'all',
    qaSearchQuery: '',
    currentDrillIndex: 0,
    isDrillRevealed: false,
    galleryFilter: 'all',
    gallerySearch: '',
    lightboxIndex: 1
  };

  // DOM 元素快取
  const elements = {
    modeBtns: document.querySelectorAll('.mode-tab-btn'),
    views: {
      modeCenter: document.getElementById('view-modeCenter'),
      modeA: document.getElementById('view-modeA'),
      modeB: document.getElementById('view-modeB'),
      modeC: document.getElementById('view-modeC'),
      modeQR: document.getElementById('view-modeQR')
    },
    // 字體與布景
    fontBtns: document.querySelectorAll('.seg-btn[data-font-val]'),
    themeBtns: document.querySelectorAll('.theme-dot-btn[data-theme-val]'),
    // C 簡報模式
    viewportBox: document.getElementById('deckViewportBox'),
    deckSlideImg: document.getElementById('deckSlideImg'),
    deckSlideBadge: document.getElementById('deckSlideBadge'),
    deckSlideTitle: document.getElementById('deckSlideTitle'),
    deckPrevBtn: document.getElementById('deckPrevBtn'),
    deckNextBtn: document.getElementById('deckNextBtn'),
    deckJumpInput: document.getElementById('deckJumpInput'),
    deckTotalSlidesSpan: document.getElementById('deckTotalSlidesSpan'),
    deckNotesPanel: document.getElementById('deckNotesPanel'),
    deckNotesContent: document.getElementById('deckNotesContent'),
    toggleNotesBtn: document.getElementById('toggleNotesBtn'),
    toggleThumbsBtn: document.getElementById('toggleThumbsBtn'),
    thumbnailDrawer: document.getElementById('thumbnailDrawer'),
    thumbnailTrack: document.getElementById('thumbnailTrack'),
    autoPlayBtn: document.getElementById('autoPlayBtn'),
    deckFullscreenBtn: document.getElementById('deckFullscreenBtn'),
    // 畫筆工具列
    toggleDrawingBtn: document.getElementById('toggleDrawingBtn'),
    drawingToolbar: document.getElementById('deckDrawingToolbar'),
    annotationCanvas: document.getElementById('annotationCanvas'),
    fsFloatingPenActivator: document.getElementById('fsFloatingPenActivator'),
    // A 成果相簿
    galleryGrid: document.getElementById('galleryGrid'),
    galleryFilterBtns: document.querySelectorAll('.filter-btn[data-gallery-filter]'),
    gallerySearchInput: document.getElementById('gallerySearchInput'),
    // B 問答模式
    qaAccordionList: document.getElementById('qaAccordionList'),
    drillViewWrap: document.getElementById('drillViewWrap'),
    qaModeBtns: document.querySelectorAll('.qa-mode-btn'),
    qaCatFilterBtns: document.querySelectorAll('.filter-btn[data-qa-cat]'),
    qaSearchInput: document.getElementById('qaSearchInput'),
    // 抽考卡片
    drillNumBadge: document.getElementById('drillNumBadge'),
    drillCounter: document.getElementById('drillCounter'),
    drillProgressFill: document.getElementById('drillProgressFill'),
    drillQuestion: document.getElementById('drillQuestion'),
    drillRevealBox: document.getElementById('drillRevealBox'),
    drillAnswerText: document.getElementById('drillAnswerText'),
    drillPointsUl: document.getElementById('drillPointsUl'),
    drillRelatedBar: document.getElementById('drillRelatedBar'),
    btnRevealAnswer: document.getElementById('btnRevealAnswer'),
    btnDrillPrev: document.getElementById('btnDrillPrev'),
    btnDrillNext: document.getElementById('btnDrillNext'),
    // 燈箱 Modal
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),
    lightboxNotes: document.getElementById('lightboxNotes'),
    lightboxBtnClose: document.getElementById('lightboxBtnClose'),
    lightboxBtnPrev: document.getElementById('lightboxBtnPrev'),
    lightboxBtnNext: document.getElementById('lightboxBtnNext'),
    // 水晶音樂
    musicPlayBtn: document.getElementById('musicPlayBtn'),
    musicTrackSelect: document.getElementById('musicTrackSelect'),
    musicMuteBtn: document.getElementById('musicMuteBtn'),
    // Toast
    toastMsg: document.getElementById('toastMsg')
  };

  // ==========================================
  // 1. 模式切換邏輯 (Center / A / B / C / QR)
  // ==========================================
  function switchMode(modeId) {
    state.currentMode = modeId;

    elements.modeBtns.forEach(btn => {
      if (btn.dataset.mode === modeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    Object.keys(elements.views).forEach(key => {
      if (elements.views[key]) {
        if (key === modeId) {
          elements.views[key].classList.add('active');
        } else {
          elements.views[key].classList.remove('active');
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (modeId === 'modeC') {
      renderSlide(state.currentSlideIndex);
      setTimeout(resizeAnnotationCanvas, 200);
    }
  }
  window.switchMode = switchMode;

  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  const brandLogoNav = document.getElementById('brandLogoNav');
  if (brandLogoNav) {
    brandLogoNav.addEventListener('click', (e) => {
      e.preventDefault();
      switchMode('modeCenter');
    });
  }

  // ==========================================
  // 2. 字體大小設定 (中、大、特大)
  // ==========================================
  function setFontSize(size) {
    state.fontSize = size;
    document.documentElement.dataset.font = size;
    document.body.dataset.font = size;
    localStorage.setItem('nmns_pref_font', size);

    elements.fontBtns.forEach(btn => {
      if (btn.dataset.fontVal === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  elements.fontBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setFontSize(btn.dataset.fontVal);
    });
  });
  setFontSize(state.fontSize);

  // ==========================================
  // 3. 布景主題設定 (淺、深、綠、藍)
  // ==========================================
  function setTheme(themeName) {
    state.theme = themeName;
    document.body.dataset.theme = themeName;
    localStorage.setItem('nmns_pref_theme', themeName);

    elements.themeBtns.forEach(btn => {
      if (btn.dataset.themeVal === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  elements.themeBtns.forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.themeVal));
  });
  setTheme(state.theme);

  // ==========================================
  // 4. 原生 Web Audio API 水晶音樂合成器 (4首風格迥異之演奏曲)
  // ==========================================
  class CrystalSynthesizer {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.volume = 0.28;
      this.currentTrack = 0;
      this.timer = null;
      this.step = 0;

      this.tracks = [
        {
          name: "晨曦微光",
          style: "清新空靈",
          bpm: 78,
          decay: 1.5,
          filterFreq: 3400,
          harmonicRatio: 2.75,
          melody: [
            523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 523.25,
            587.33, 659.25, 880.00, 1046.50, 1174.66, 1046.50, 880.00, 783.99
          ]
        },
        {
          name: "微觀探索",
          style: "深邃禪意",
          bpm: 48,
          decay: 3.2,
          filterFreq: 1500,
          harmonicRatio: 2.01,
          melody: [
            293.66, 440.00, 349.23, 523.25, 440.00, 392.00, 349.23, 293.66,
            220.00, 329.63, 293.66, 440.00, 392.00, 349.23, 293.66, 220.00
          ]
        },
        {
          name: "生生不息",
          style: "三拍輕快",
          bpm: 104,
          decay: 1.4,
          filterFreq: 2800,
          harmonicRatio: 3.01,
          melody: [
            392.00, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 392.00,
            440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00
          ]
        },
        {
          name: "星空靜夜",
          style: "溫暖祥和",
          bpm: 60,
          decay: 2.6,
          filterFreq: 2200,
          harmonicRatio: 2.50,
          melody: [
            329.63, 440.00, 493.88, 659.25, 587.33, 493.88, 440.00, 329.63,
            293.66, 392.00, 440.00, 587.33, 523.25, 440.00, 392.00, 293.66
          ]
        }
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playNote(freq, decay, filterFreq, harmonicRatio) {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      const oscPrimary = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gainPrimary = this.ctx.createGain();
      const gainHarmonic = this.ctx.createGain();
      const biquadFilter = this.ctx.createBiquadFilter();
      const masterGain = this.ctx.createGain();

      biquadFilter.type = "lowpass";
      biquadFilter.frequency.setValueAtTime(filterFreq, now);

      oscPrimary.type = "sine";
      oscPrimary.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = "sine";
      oscHarmonic.frequency.setValueAtTime(freq * harmonicRatio, now);

      const targetVol = this.volume;
      masterGain.gain.setValueAtTime(targetVol, now);

      gainPrimary.gain.setValueAtTime(0.0001, now);
      gainPrimary.gain.exponentialRampToValueAtTime(0.7, now + 0.015);
      gainPrimary.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      gainHarmonic.gain.setValueAtTime(0.0001, now);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.35, now + 0.012);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.75);

      oscPrimary.connect(gainPrimary);
      oscHarmonic.connect(gainHarmonic);
      gainPrimary.connect(biquadFilter);
      gainHarmonic.connect(biquadFilter);
      biquadFilter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      oscPrimary.start(now);
      oscHarmonic.start(now);
      oscPrimary.stop(now + decay + 0.1);
      oscHarmonic.stop(now + decay + 0.1);
    }

    tick() {
      const track = this.tracks[this.currentTrack];
      const freq = track.melody[this.step % track.melody.length];
      this.playNote(freq, track.decay, track.filterFreq, track.harmonicRatio);
      this.step++;
    }

    start() {
      this.init();
      this.isPlaying = true;
      const track = this.tracks[this.currentTrack];
      const interval = (60 / track.bpm) * 1000;
      this.tick();
      clearInterval(this.timer);
      this.timer = setInterval(() => this.tick(), interval);
    }

    stop() {
      this.isPlaying = false;
      clearInterval(this.timer);
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.start();
        return true;
      }
    }

    setTrack(idx) {
      this.currentTrack = idx;
      this.step = 0;
      if (this.isPlaying) {
        this.start();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }
  }

  const crystal = new CrystalSynthesizer();

  if (elements.musicPlayBtn) {
    elements.musicPlayBtn.addEventListener('click', () => {
      const isNowPlaying = crystal.toggle();
      elements.musicPlayBtn.innerHTML = isNowPlaying ? '⏸️' : '🎵';
      elements.musicPlayBtn.title = isNowPlaying ? '暫停水晶音樂' : '播放水晶音樂';
    });
  }

  if (elements.musicTrackSelect) {
    elements.musicTrackSelect.addEventListener('change', (e) => {
      crystal.setTrack(parseInt(e.target.value, 10));
    });
  }

  if (elements.musicMuteBtn) {
    elements.musicMuteBtn.addEventListener('click', () => {
      const muted = crystal.toggleMute();
      elements.musicMuteBtn.innerHTML = muted ? '🔇' : '🔊';
      elements.musicMuteBtn.title = muted ? '取消靜音' : '靜音';
    });
  }

  // ==========================================
  // 5. C 簡報模式 (Slide Presentation Deck)
  // ==========================================
  function renderSlide(index) {
    if (!window.SLIDES_DATA || window.SLIDES_DATA.length === 0) return;
    if (index < 1) index = 1;
    if (index > state.totalSlides) index = state.totalSlides;
    state.currentSlideIndex = index;

    const slide = window.SLIDES_DATA[index - 1];

    if (elements.deckSlideImg) {
      elements.deckSlideImg.src = slide.image;
      elements.deckSlideImg.alt = slide.title;
    }
    if (elements.deckSlideBadge) {
      elements.deckSlideBadge.textContent = `P. ${slide.slide_num} / ${state.totalSlides} · ${slide.category_name}`;
    }
    if (elements.deckSlideTitle) {
      elements.deckSlideTitle.textContent = slide.title;
    }
    if (elements.deckJumpInput) {
      elements.deckJumpInput.value = slide.slide_num;
    }
    if (elements.deckNotesContent) {
      elements.deckNotesContent.textContent = slide.notes || "暫無講者備忘。";
    }

    // 更新縮圖抽屜高亮
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach(t => {
      if (parseInt(t.dataset.slideNum, 10) === index) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });

    clearAnnotationCanvas();
  }

  function nextSlide() {
    if (state.currentSlideIndex < state.totalSlides) {
      renderSlide(state.currentSlideIndex + 1);
    } else {
      renderSlide(1);
    }
  }

  function prevSlide() {
    if (state.currentSlideIndex > 1) {
      renderSlide(state.currentSlideIndex - 1);
    } else {
      renderSlide(state.totalSlides);
    }
  }

  if (elements.deckPrevBtn) elements.deckPrevBtn.addEventListener('click', prevSlide);
  if (elements.deckNextBtn) elements.deckNextBtn.addEventListener('click', nextSlide);

  if (elements.deckJumpInput) {
    elements.deckJumpInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) renderSlide(val);
    });
    elements.deckJumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) renderSlide(val);
      }
    });
  }

  // 講者備忘錄開關 (快捷鍵 N)
  if (elements.toggleNotesBtn) {
    elements.toggleNotesBtn.addEventListener('click', () => {
      elements.deckNotesPanel.classList.toggle('active');
    });
  }

  // 底部縮圖抽屜開關
  if (elements.toggleThumbsBtn) {
    elements.toggleThumbsBtn.addEventListener('click', () => {
      elements.thumbnailDrawer.classList.toggle('active');
    });
  }

  // 自動播放
  if (elements.autoPlayBtn) {
    elements.autoPlayBtn.addEventListener('click', () => {
      state.isAutoPlaying = !state.isAutoPlaying;
      if (state.isAutoPlaying) {
        elements.autoPlayBtn.innerHTML = '⏸️ 停止輪播';
        elements.autoPlayBtn.classList.add('primary');
        state.autoPlayTimer = setInterval(nextSlide, 4500);
      } else {
        elements.autoPlayBtn.innerHTML = '▶️ 自動輪播';
        elements.autoPlayBtn.classList.remove('primary');
        clearInterval(state.autoPlayTimer);
      }
    });
  }

  // 全螢幕投影 (快捷鍵 F)
  function enterFullscreen() {
    const box = elements.viewportBox;
    if (!box) return;
    if (box.requestFullscreen) {
      box.requestFullscreen();
    } else if (box.webkitRequestFullscreen) {
      box.webkitRequestFullscreen();
    }
  }

  if (elements.deckFullscreenBtn) {
    elements.deckFullscreenBtn.addEventListener('click', enterFullscreen);
  }

  // 建立縮圖抽屜
  function buildThumbnailTrack() {
    if (!elements.thumbnailTrack || !window.SLIDES_DATA) return;
    elements.thumbnailTrack.innerHTML = '';
    window.SLIDES_DATA.forEach(slide => {
      const item = document.createElement('div');
      item.className = 'thumb-item';
      item.dataset.slideNum = slide.slide_num;
      item.innerHTML = `
        <img src="${slide.thumb}" alt="${slide.title}" loading="lazy" />
        <div class="thumb-num">P.${slide.slide_num}</div>
      `;
      item.addEventListener('click', () => renderSlide(slide.slide_num));
      elements.thumbnailTrack.appendChild(item);
    });
  }
  buildThumbnailTrack();

  window.jumpToSlide = function(slideNum) {
    switchMode('modeC');
    renderSlide(slideNum);
  };

  // ==========================================
  // 6. 全螢幕微型正下方畫筆白板工具列 (Annotation Engine)
  // 規範：高度 22px、貼底 5px、平時半透明 0.38、懸停 1.0、實體關閉鈕 + Esc/D/P
  // ==========================================
  const drawState = {
    isActive: false,
    currentTool: 'pen',
    color: '#ef4444',
    widthLevel: 1,
    widths: {
      pen: [3, 6, 12],
      highlighter: [14, 24, 38],
      line: [3, 6, 12],
      arrow: [3, 6, 12],
      rect: [3, 6, 12],
      circle: [3, 6, 12],
      eraser: [20, 36, 54]
    },
    isMouseDown: false,
    startX: 0,
    startY: 0,
    undoStack: [],
    snapshot: null
  };

  const canvas = elements.annotationCanvas;
  const ctx = canvas ? canvas.getContext('2d') : null;

  function resizeAnnotationCanvas() {
    if (!canvas || !elements.viewportBox) return;
    const rect = elements.viewportBox.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (tempImg && tempImg.width > 0) {
        ctx.putImageData(tempImg, 0, 0);
      }
    }
  }
  window.addEventListener('resize', resizeAnnotationCanvas);

  function clearAnnotationCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawState.undoStack = [];
  }

  function saveUndoState() {
    if (!ctx || !canvas) return;
    if (drawState.undoStack.length >= 15) {
      drawState.undoStack.shift();
    }
    drawState.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  function restoreUndoState() {
    if (!ctx || !canvas || drawState.undoStack.length === 0) return;
    const imgData = drawState.undoStack.pop();
    ctx.putImageData(imgData, 0, 0);
  }

  function turnOnDrawingMode() {
    drawState.isActive = true;
    if (canvas) canvas.classList.add('active');
    if (elements.drawingToolbar) {
      elements.drawingToolbar.classList.remove('is-hidden');
      elements.drawingToolbar.style.display = 'flex';
    }
    if (elements.toggleDrawingBtn) {
      elements.toggleDrawingBtn.innerHTML = '✏️ 關閉畫筆';
      elements.toggleDrawingBtn.classList.add('primary');
    }
    if (elements.fsFloatingPenActivator) {
      elements.fsFloatingPenActivator.classList.remove('visible');
    }
    resizeAnnotationCanvas();
  }

  function turnOffDrawingMode() {
    drawState.isActive = false;
    if (canvas) canvas.classList.remove('active');
    if (elements.drawingToolbar) {
      elements.drawingToolbar.classList.add('is-hidden');
    }
    if (elements.toggleDrawingBtn) {
      elements.toggleDrawingBtn.innerHTML = '✏️ 螢幕畫筆';
      elements.toggleDrawingBtn.classList.remove('primary');
    }
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFs && elements.fsFloatingPenActivator) {
      elements.fsFloatingPenActivator.classList.add('visible');
    }
  }

  function toggleDrawingMode() {
    if (drawState.isActive && elements.drawingToolbar && !elements.drawingToolbar.classList.contains('is-hidden')) {
      turnOffDrawingMode();
    } else {
      turnOnDrawingMode();
    }
  }

  if (elements.toggleDrawingBtn) {
    elements.toggleDrawingBtn.addEventListener('click', toggleDrawingMode);
  }

  if (elements.fsFloatingPenActivator) {
    elements.fsFloatingPenActivator.addEventListener('click', turnOnDrawingMode);
  }

  const btnCloseDrawing = document.getElementById('btnCloseDrawing');
  if (btnCloseDrawing) {
    btnCloseDrawing.addEventListener('click', turnOffDrawingMode);
  }

  // 工具列按鈕事件綁定
  const drawToolBtns = document.querySelectorAll('.draw-btn[data-tool]');
  drawToolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      drawToolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawState.currentTool = btn.dataset.tool;
    });
  });

  const drawColorDots = document.querySelectorAll('.draw-color-dot[data-color]');
  drawColorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      drawColorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      drawState.color = dot.dataset.color;
    });
  });

  const btnDrawUndo = document.getElementById('btnDrawUndo');
  if (btnDrawUndo) btnDrawUndo.addEventListener('click', restoreUndoState);

  const btnDrawClear = document.getElementById('btnDrawClear');
  if (btnDrawClear) btnDrawClear.addEventListener('click', clearAnnotationCanvas);

  // Canvas 繪圖事件
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (!drawState.isActive || !ctx) return;
    drawState.isMouseDown = true;
    const pos = getCanvasPos(e);
    drawState.startX = pos.x;
    drawState.startY = pos.y;
    saveUndoState();
    drawState.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (drawState.currentTool === 'pen' || drawState.currentTool === 'highlighter' || drawState.currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }

  function drawMove(e) {
    if (!drawState.isActive || !drawState.isMouseDown || !ctx) return;
    const pos = getCanvasPos(e);
    const tool = drawState.currentTool;
    const width = drawState.widths[tool][drawState.widthLevel];

    if (tool === 'pen') {
      ctx.strokeStyle = drawState.color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = drawState.color;
      ctx.lineWidth = width;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.globalAlpha = 0.35;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(pos.x - width / 2, pos.y - width / 2, width, width);
    } else {
      // 幾何形狀預覽
      ctx.putImageData(drawState.snapshot, 0, 0);
      ctx.strokeStyle = drawState.color;
      ctx.lineWidth = width;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.beginPath();

      if (tool === 'line') {
        ctx.moveTo(drawState.startX, drawState.startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawArrow(ctx, drawState.startX, drawState.startY, pos.x, pos.y, width);
      } else if (tool === 'rect') {
        ctx.strokeRect(drawState.startX, drawState.startY, pos.x - drawState.startX, pos.y - drawState.startY);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - drawState.startX, 2) + Math.pow(pos.y - drawState.startY, 2));
        ctx.arc(drawState.startX, drawState.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function stopDrawing() {
    if (!drawState.isMouseDown) return;
    drawState.isMouseDown = false;
    if (ctx) ctx.globalAlpha = 1.0;
  }

  function drawArrow(context, fromx, fromy, tox, toy, width) {
    const headlen = Math.max(12, width * 2.5);
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();

    context.beginPath();
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fillStyle = drawState.color;
    context.fill();
  }

  if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', drawMove);
    window.addEventListener('mouseup', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      drawMove(e);
    }, { passive: false });
    window.addEventListener('touchend', stopDrawing);
  }

  // 全螢幕狀態變化監聽
  function handleFullscreenStateChange() {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFs) {
      elements.viewportBox.classList.add('is-fullscreen');
      turnOnDrawingMode();
    } else {
      elements.viewportBox.classList.remove('is-fullscreen');
      turnOffDrawingMode();
    }
    setTimeout(resizeAnnotationCanvas, 250);
  }

  document.addEventListener('fullscreenchange', handleFullscreenStateChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenStateChange);

  // 全域鍵盤快捷鍵 (簡報模式專屬)
  window.addEventListener('keydown', (e) => {
    if (state.currentMode === 'modeC' && document.activeElement.tagName !== 'INPUT') {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        enterFullscreen();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (elements.toggleNotesBtn) elements.toggleNotesBtn.click();
      } else if (e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleDrawingMode();
      } else if (e.key === 'Escape' && drawState.isActive) {
        e.preventDefault();
        turnOffDrawingMode();
      }
    }
  });

  // ==========================================
  // 7. A 成果網頁：照片畫廊與高清燈箱
  // ==========================================
  function renderGallery() {
    if (!elements.galleryGrid || !window.SLIDES_DATA) return;
    elements.galleryGrid.innerHTML = '';

    const filter = state.galleryFilter;
    const query = state.gallerySearch.trim().toLowerCase();

    const filtered = window.SLIDES_DATA.filter(slide => {
      const matchCat = (filter === 'all' || slide.category === filter);
      const matchQuery = !query || slide.title.toLowerCase().includes(query) || (slide.notes && slide.notes.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    filtered.forEach(slide => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <div class="gallery-thumb-wrap">
          <img src="${slide.thumb}" alt="${slide.title}" loading="lazy" />
          <div class="gallery-slide-badge">P.${slide.slide_num}</div>
        </div>
        <div class="gallery-info">
          <div class="gallery-item-cat">${slide.category_name}</div>
          <div class="gallery-item-title">${slide.title}</div>
        </div>
      `;
      item.addEventListener('click', () => openLightbox(slide.slide_num));
      elements.galleryGrid.appendChild(item);
    });
  }

  if (elements.galleryFilterBtns) {
    elements.galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.galleryFilter = btn.dataset.galleryFilter;
        renderGallery();
      });
    });
  }

  if (elements.gallerySearchInput) {
    elements.gallerySearchInput.addEventListener('input', (e) => {
      state.gallerySearch = e.target.value;
      renderGallery();
    });
  }

  // 燈箱功能
  function openLightbox(slideNum) {
    state.lightboxIndex = slideNum;
    updateLightboxContent();
    elements.lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    elements.lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const slide = window.SLIDES_DATA[state.lightboxIndex - 1];
    if (!slide) return;
    elements.lightboxImg.src = slide.image;
    elements.lightboxImg.alt = slide.title;
    elements.lightboxCaption.textContent = `[P.${slide.slide_num}] ${slide.title}`;
    elements.lightboxNotes.textContent = slide.notes || "";
  }

  function lightboxNext() {
    if (state.lightboxIndex < state.totalSlides) {
      state.lightboxIndex++;
    } else {
      state.lightboxIndex = 1;
    }
    updateLightboxContent();
  }

  function lightboxPrev() {
    if (state.lightboxIndex > 1) {
      state.lightboxIndex--;
    } else {
      state.lightboxIndex = state.totalSlides;
    }
    updateLightboxContent();
  }

  if (elements.lightboxBtnClose) elements.lightboxBtnClose.addEventListener('click', closeLightbox);
  if (elements.lightboxBtnNext) elements.lightboxBtnNext.addEventListener('click', lightboxNext);
  if (elements.lightboxBtnPrev) elements.lightboxBtnPrev.addEventListener('click', lightboxPrev);

  window.addEventListener('keydown', (e) => {
    if (elements.lightboxModal && elements.lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'ArrowLeft') lightboxPrev();
    }
  });

  // ==========================================
  // 8. B 問答模式與抽考挑戰 (QA & Drill)
  // ==========================================
  function renderQaList() {
    if (!elements.qaAccordionList || !window.QA_DATA) return;
    elements.qaAccordionList.innerHTML = '';

    const filter = state.activeQaCategory;
    const query = state.qaSearchQuery.trim().toLowerCase();

    const filtered = window.QA_DATA.filter(qa => {
      const matchCat = (filter === 'all' || qa.category === filter);
      const matchQuery = !query || qa.question.toLowerCase().includes(query) || qa.answer.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    filtered.forEach(qa => {
      const card = document.createElement('div');
      card.className = 'qa-card';

      const relatedBtnsHtml = qa.related_slides.map(s => `
        <button class="btn-mini-slide" onclick="jumpToSlide(${s})">P.${s} ➔</button>
      `).join('');

      const pointsHtml = qa.key_points.map(pt => `<li>${pt}</li>`).join('');

      card.innerHTML = `
        <div class="qa-card-head">
          <div class="qa-head-left">
            <div class="qa-num-badge">Q${qa.id}</div>
            <div class="qa-question-text">${qa.question}</div>
          </div>
          <div class="qa-toggle-icon">▼</div>
        </div>
        <div class="qa-card-body">
          <div class="qa-answer-text">${qa.answer}</div>
          <div class="qa-points-box">
            <ul>${pointsHtml}</ul>
          </div>
          <div class="qa-related-bar">
            <span class="qa-related-label">對應簡報現場展板：</span>
            ${relatedBtnsHtml}
          </div>
        </div>
      `;

      card.querySelector('.qa-card-head').addEventListener('click', () => {
        card.classList.toggle('open');
      });

      elements.qaAccordionList.appendChild(card);
    });
  }

  if (elements.qaCatFilterBtns) {
    elements.qaCatFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.qaCatFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeQaCategory = btn.dataset.qaCat;
        renderQaList();
      });
    });
  }

  if (elements.qaSearchInput) {
    elements.qaSearchInput.addEventListener('input', (e) => {
      state.qaSearchQuery = e.target.value;
      renderQaList();
    });
  }

  // 模式切換：列表模式 vs 抽考卡片模式
  elements.qaModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.qaModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.qaSubMode = btn.dataset.qaMode;

      if (state.qaSubMode === 'list') {
        elements.qaAccordionList.style.display = 'flex';
        elements.drillViewWrap.classList.remove('active');
      } else {
        elements.qaAccordionList.style.display = 'none';
        elements.drillViewWrap.classList.add('active');
        renderDrillCard();
      }
    });
  });

  // 抽考卡片邏輯
  function renderDrillCard() {
    if (!window.QA_DATA || window.QA_DATA.length === 0) return;
    const total = window.QA_DATA.length;
    const qa = window.QA_DATA[state.currentDrillIndex];

    state.isDrillRevealed = false;
    elements.drillRevealBox.classList.remove('revealed');
    elements.btnRevealAnswer.textContent = '💡 揭曉解答與學習重點';

    elements.drillNumBadge.textContent = `Q${qa.id} · ${qa.category_name}`;
    elements.drillCounter.textContent = `${state.currentDrillIndex + 1} / ${total}`;
    elements.drillProgressFill.style.width = `${((state.currentDrillIndex + 1) / total) * 100}%`;
    elements.drillQuestion.textContent = qa.question;

    elements.drillAnswerText.innerHTML = qa.answer;
    elements.drillPointsUl.innerHTML = qa.key_points.map(pt => `<li>${pt}</li>`).join('');

    elements.drillRelatedBar.innerHTML = qa.related_slides.map(s => `
      <button class="btn-mini-slide" onclick="jumpToSlide(${s})">P.${s} ➔</button>
    `).join('');
  }

  if (elements.btnRevealAnswer) {
    elements.btnRevealAnswer.addEventListener('click', () => {
      state.isDrillRevealed = !state.isDrillRevealed;
      if (state.isDrillRevealed) {
        elements.drillRevealBox.classList.add('revealed');
        elements.btnRevealAnswer.textContent = '🙈 隱藏解答';
      } else {
        elements.drillRevealBox.classList.remove('revealed');
        elements.btnRevealAnswer.textContent = '💡 揭曉解答與學習重點';
      }
    });
  }

  if (elements.btnDrillNext) {
    elements.btnDrillNext.addEventListener('click', () => {
      if (state.currentDrillIndex < window.QA_DATA.length - 1) {
        state.currentDrillIndex++;
      } else {
        state.currentDrillIndex = 0;
      }
      renderDrillCard();
    });
  }

  if (elements.btnDrillPrev) {
    elements.btnDrillPrev.addEventListener('click', () => {
      if (state.currentDrillIndex > 0) {
        state.currentDrillIndex--;
      } else {
        state.currentDrillIndex = window.QA_DATA.length - 1;
      }
      renderDrillCard();
    });
  }

  // ==========================================
  // 9. QR Code 燈箱與複製網址 Toast
  // ==========================================
  const qrBoxes = document.querySelectorAll('.qr-img-box');
  qrBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const img = box.querySelector('img');
      if (img) {
        elements.lightboxImg.src = img.src;
        elements.lightboxImg.alt = "QR 碼高畫質放大";
        elements.lightboxCaption.textContent = "條碼高解析放大（方便遠距掃描）";
        elements.lightboxNotes.textContent = "請使用手機相機直接掃描條碼開啟本教學網站。";
        elements.lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function showToast(msg) {
    if (!elements.toastMsg) return;
    elements.toastMsg.textContent = msg;
    elements.toastMsg.classList.add('show');
    setTimeout(() => {
      elements.toastMsg.classList.remove('show');
    }, 2400);
  }

  const copyBtns = document.querySelectorAll('.btn-copy-url[data-copy-target]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.copyTarget;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(target).then(() => {
          showToast('✅ 網址已成功複製至剪貼簿！');
        }).catch(() => {
          fallbackCopyText(target);
        });
      } else {
        fallbackCopyText(target);
      }
    });
  });

  function fallbackCopyText(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('✅ 網址已成功複製至剪貼簿！');
  }

  // 初始化首次載入
  renderSlide(1);
  renderGallery();
  renderQaList();
});
