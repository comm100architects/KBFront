import { repeat, words, chance } from "./genhelper";

export default () =>
  `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <h1>${words(3)()}</h1>\n` +
  repeat(
    3,
    () =>
      `
    <div>
      <h3>${chance.sentence()}</h3>
      <p>
        ${chance.paragraph()}
      </p>
    </div>`,
  ) +
  `
  </body>
</html>`;
