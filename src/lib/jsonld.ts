/** Serialise JSON-LD safely for inline <script>: prevents </script> breakouts. */
export const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");
