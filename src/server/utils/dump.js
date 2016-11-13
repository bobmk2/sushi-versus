import util from 'util';

function dump(obj) {
  console.log(util.inspect(obj, {depth: null}));
}

export default dump;
