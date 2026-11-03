// Data shared by the example labs.
export const PTS: [number, number][] = [
  [1, 1.8],
  [2, 4.4],
  [3, 5.7],
  [4, 8.5],
  [5, 9.6],
];

/** mean squared error of y ≈ a + b·x on PTS */
export const mse = (a: number, b: number) => PTS.reduce((s, [x, y]) => s + (y - a - b * x) ** 2, 0) / PTS.length;
