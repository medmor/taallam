module.exports = {
  locales: ["en", "ar"],
  defaultLocale: "en",
  pages: {
    "/": ["home"],
    "/stories": ["stories"],
    "/courses/[level]": ["level"],
    "/courses/[level]/[subject]": ["subject"],
  },
};
