console.error(
  `\n` +
    `Build Failed: react-storefront/webpack/edge has been removed.  Use react-storefront-edge/webpack instead.\n` +
    `To add react-storefront-edge to your app run:\n\n` +
    `npm i --save-dev react-storefront-edge@^1.0.0\n\n` +
    `Then replace "react-storefront/webpack/edge" with "react-storefront-edge/webpack" in config/webpack.prod.edge.js.\n`
)

process.exit(1)
