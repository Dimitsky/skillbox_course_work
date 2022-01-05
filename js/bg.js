// 

function Bg(options) {
  const items = document.querySelectorAll('.bg__item');

  // Зациклить
  if ( !options.loop ) options.loop = false;
  else options.loop = true;

  // Задержка
  if ( !options.delay ) options.delay = 5000;

  let index = 1;
  const intervalId = setInterval( () => {
    for (let i = 0; i < items.length; i++)
      items[i].classList.remove('active');

    items[index].classList.add('active');
    index++;

    if (index >= items.length) {
      if ( options.loop ) index = 0;
      else clearInterval(intervalId);
    }
  }, options.delay );
}
