export const oneDTo2D = (index: number, size: number) => ({
  x: index % size,
  y: Math.floor(index / size),
});

export const twoDTo1D = (x: number, y: number, size: number) => y * size + x;
