(async function() {
  let result = await fetch('http://localhost:9000/carts', {
      method: 'POST',
      mode: 'cors',
  });
})();
