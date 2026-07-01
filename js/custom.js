/**
 * Custom JS for Cinder's Notebook
 * 添加页面加载后的微交互
 */

document.addEventListener('DOMContentLoaded', function () {
  // 为首页文章卡片添加渐入动画
  const cards = document.querySelectorAll('.index-card');
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(function (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // 代码块添加语言标签微提示
  const codeBlocks = document.querySelectorAll('figure.highlight');
  codeBlocks.forEach(function (block) {
    const lang = block.getAttribute('class') || '';
    block.setAttribute('data-lang', lang.replace('highlight', '').trim());
  });

  console.log('✨ Cinder\'s Notebook — 且听风吟，静待花开');
});
