// 此脚本必须在 <head> 中尽早执行，以阻止白屏闪烁
// 它会在页面渲染出任何内容之前，将保存在本地的主题立即应用生效
(function() {
    // 拉取外观模式 (默认 auto)
    const savedMode = localStorage.getItem('apple_mode') || 'auto';
    let activeMode = savedMode;
    if (savedMode === 'auto') {
        activeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-mode', activeMode);

    // 拉取色彩 (默认 aurora)
    const savedColor = localStorage.getItem('apple_color') || 'aurora';
    document.documentElement.setAttribute('data-color', savedColor);
})();