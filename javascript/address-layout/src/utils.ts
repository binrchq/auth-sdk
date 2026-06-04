export const addCommaAfter = (value: string | any) => {
  if (value && typeof value === 'string') {
    return `${value},`;
  }
  return value;
};

export const capitalize = (value: string | any) => {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value;
};

export const capitalizeWhenTwo = (value: string | any) => {
  if (value && typeof value === 'string' && value.length === 2) {
    return value.toUpperCase();
  }
  return value;
};

export const pascalCase = (value: string | any) => {
  if (typeof value === 'string') {
    return value.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
  }
  return value;
};
