// existing functions here...
function bindCurtainMenu() {
  const trigger = document.getElementById("cdMenuTrigger");
  const curtain = document.getElementById("navCurtain");
  if (!trigger || !curtain) return;

  const links = curtain.querySelectorAll("a");

  const open = () => {
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    curtain.hidden = false;
    void curtain.offsetHeight;
    curtain.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    curtain.classList.remove("open");
    document.documentElement.style.overflow = "";
    setTimeout(() => (curtain.hidden = true), 250);
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    trigger.classList.contains("is-open") ? close() : open();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && trigger.classList.contains("is-open")) close();
  });
  links.forEach((a) => a.addEventListener("click", close));
}

/* ✅ Add this BELOW everything else */
window.addEventListener("resize", () => {
  const header = document.querySelector(".nav-wrap");
  const curtain = document.getElementById("navCurtain");
  if (header && curtain) {
    const h = header.offsetHeight;
    curtain.style.top = `${h}px`;
    curtain.style.height = `calc(100vh - ${h}px)`;
  }
});
