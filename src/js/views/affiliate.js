const loadAff = function () {
  // Popup Affiliate
  (function popupAffHide() {
    setTimeout(() => {
      document.querySelector(".affiliate-popup").classList.add("hidden");
      popupAffHide();
    }, 4500);
  })();

  // Affiliate Link loading
  let randAffNum = Math.floor(Math.random() * 6);
  // let randAffNum = 5;
  let affEls = "";
  affEls = document.querySelectorAll(
    ".affiliate-1, .affiliate-2, .affiliate-3, .affiliate-4, .affiliate-5, .affiliate-6"
  );
  affEls.forEach((el) => {
    el.classList.add("hidden");
  });
  const getAff = function () {
    randAffNum = (randAffNum + 1) % 6;
    return affEls[randAffNum];
  };
  let affEl = getAff();
  affEl.classList.remove("hidden");

  (function affHide() {
    setTimeout(() => {
      affEl.classList.add("aff-hidden");
      affEl.classList.remove("aff-visible");
      document
        .getElementsByClassName("affiliate-disclaimer")[0]
        .classList.add("aff-hidden");
      document
        .getElementsByClassName("affiliate-disclaimer")[0]
        .classList.remove("aff-visible");

      setTimeout(() => {
        affEl.classList.add("hidden");
        affEl.classList.remove("aff-hidden");
        affEl = getAff();
        affEl.style.opacity = "0";
        setTimeout(() => {
          affEl.classList.remove("hidden");
          setTimeout(() => {
            affEl.classList.add("aff-visible");
          }, 100);
        }, 100);
        document
          .getElementsByClassName("affiliate-disclaimer")[0]
          .classList.add("aff-visible");
        document
          .getElementsByClassName("affiliate-disclaimer")[0]
          .classList.remove("aff-hidden");
      }, 2300);

      affHide();
    }, 1000 * 20);
  })();
};

export default loadAff;
