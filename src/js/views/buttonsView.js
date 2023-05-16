

export const loadChangeMapButton = function (handler) {
  const changeMap = document.getElementById("change-map");
  changeMap.addEventListener("click", (e) => {
    const btn = e.target.closest("#change-map");
    if (!btn) return;
    handler();
  });
};

export const loadLatestListButton = function () {
    const changeMap = document.getElementById("ChangeMap");
    changeMap.addEventListener("click", (e) => {
      const btn = e.target.closest("#ChangeMap");
      if (!btn) return;
      handler();
    });
};
