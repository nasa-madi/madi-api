import path from 'path';
import newman from 'newman';

const moduleURL = new URL(import.meta.url);
const collectionPath = path.resolve(path.dirname(moduleURL.pathname), 'contract.collection.json');

const runNewman = () => {
  return new Promise((resolve, reject) => {
    newman.run({
      collection: collectionPath,
      // environment: 'environment.json',
      // globals: {
      //   globalVariable: 'globalValue',
      // },
    }, (error, summary) => {
      if (error) {
        reject(error);
      } else {
        resolve(summary);
      }
    });
  });
};

runNewman()
  .then((summary) => {
    console.log(summary);
  })
  .catch((error) => {
    console.error(error);
  });