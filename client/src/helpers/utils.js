export const convertSettingsToString = ({rows, cols, bombs}) => `${rows}x${cols}x${bombs}`;

export const splitSettingsFromString = settings => {
  const splitted = settings.split('x');
  
  return {
    rows: splitted[0],
    cols: splitted[1],
    bombs: splitted[2]
  };
}