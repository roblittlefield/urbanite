export const loadChangeMapButton = function (handler) {
  const changeMap = document.getElementById("change-map");
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map");
    if (!btn) return;
    handler();
  });
};

export const loadLatestListButton = function (handler) {
  const latestButton = document.getElementById("latest-list");
  latestButton.addEventListener("click", (e) => {
    console.log(`pressed`);
    const btn = e.target.closest("#latest-list");
    if (!btn) return;
    console.log(`button pressed`);
    handler();
  });
};
