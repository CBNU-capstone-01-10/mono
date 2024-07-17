//random string

function getRandomString(len: number) {
  let rs = '';

  const [min, max] = [33, 125];

  for (let i = 0; i < len; i++) {
    rs += String.fromCharCode(Math.floor(Math.random() * (max - min) + min));
  }

  return rs;
}

export default getRandomString;
