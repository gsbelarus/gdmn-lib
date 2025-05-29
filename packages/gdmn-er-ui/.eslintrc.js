module.exports = {
  root: true,
  extends: ["gdmn-eslint-config/library.js", "plugin:storybook/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
