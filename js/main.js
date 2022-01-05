const MYAPP = {
  ymaps: null,
};

//Декоратор троттлинга
function throttle(f, ms) {
  let isThrottled = false,
      savedArgs,
      savedThis;

  function wrapper() {
    if ( isThrottled ) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }

  f.apply( this, arguments );
  isThrottled = true;
  setTimeout( function() {
    isThrottled = false;
    if ( savedArgs ) {
      wrapper.apply( savedThis, savedArgs );
      savedArgs = savedThis = null;
    }
  }, ms );
  }

  return wrapper;
}

//
function clickCloseHandler(e) {
  if ( e.target.closest('[data-menu__content]') ) return
  
  const menuContainerArr = document.querySelectorAll('[data-menu__container]');

  menuContainerArr.forEach( m => {
    closeMenu(m);
  });
  document.removeEventListener('click', clickCloseHandler);
 }

//Найти селектор в указаном елементе
function findElementIn(parent, selector) {
  return parent.querySelector(selector) || null;
}

//Закрыть меню
function closeMenu(menuContainer) {
  const menuBtn = menuContainer.querySelector('[data-menu__button]');
  const menuContent = menuContainer.querySelector('[data-menu__content]');

  menuBtn.setAttribute('aria-expanded', 'false');
  menuContent.classList.remove('active');
  document.removeEventListener('click', clickCloseHandler);
}

//Открыть меню
function openMenu(menuContainer) {
  const menuBtn = menuContainer.querySelector('[data-menu__button]');
  const menuContent = menuContainer.querySelector('[data-menu__content]');

  menuBtn.setAttribute('aria-expanded', 'true');
  menuContent.classList.add('active');
  document.addEventListener('click', clickCloseHandler);
}

//
function getClosestMenuContainer(elem) {
  const menuContainer = elem.closest('[data-menu__container]');

  return menuContainer;
}

//Возвращает текущее состояние атрибута aria-expanded
function isExpanded(elem) {
  return elem.getAttribute('aria-expanded') === 'true';
}

//Инициализация фонового слайдера блока hero
(function () {
  new Bg({
    loop: true,
    delay: 18000,
  });
})();

//SimpleBar
(function () {
  const simplebars = document.querySelectorAll('[data-simplebar]');

  simplebars.forEach( sb => {
    new SimpleBar( sb, {
      autoHide: false,
    } );
  } )
})();

//Обработчик открытия меню
function menuHandler(selector) {
  const menuBtnArr = document.querySelectorAll(selector);
  
  menuBtnArr.forEach( menuBtn => {
    menuBtn.addEventListener( 'click', function(e) {
      if ( isExpanded(menuBtn) ) {
        closeMenu( getClosestMenuContainer(menuBtn) );
      } else {
        menuBtnArr.forEach( menuBtn => {
          closeMenu( getClosestMenuContainer(menuBtn) );
        } );
        
        const menuContainer = getClosestMenuContainer(menuBtn);
        
        openMenu(menuContainer);
        e.stopPropagation();
      }
      
    } );
  } )
}

//Удалаяет placeholder при фокусе
function handlerRemovePlaceholderOnFocus(e) {
  e.target.setAttribute('placeholder', '');
}

//Возвращает placeholder обратно при потере фокуса
function handlerAddPlaceholderOnBlur(e) {
  e.target.setAttribute('placeholder', 'Поиск по сайту');
}

//Данная функция необходима для корректного переключения страниц слайдера, при работе с клавиатурой
//Управляет фокусом элементов внутри Swiper. Параметры: e - объект события, swiperArr - массив объекстов swiper
function onFocusSwiperSlide(e, swipersArr) {
  //Текущий слайдер
  const currentSwiper = e.target.closest('.swiper');

  //Прервать если это не слайдер
  if (!currentSwiper) return;

  //Находит объект swiper соответствующий текущему слайдеру 
  const swiperObj = swipersArr.find( item => currentSwiper.className.includes( item.params.el.replace('.', '') ) );
  //Текущий слайд
  const currentSlide = e.target.closest(`.${swiperObj.params.slideClass}`);
  //Количество слайдов на страницу
  const slidesPerPage = swiperObj.params.slidesPerColumn * swiperObj.params.slidesPerView;
  //Индекс слайда содержащего сфокусированный элемент
  const activeFocusedIndex = parseInt( currentSlide.getAttribute('aria-label') );
  //Номер страницы на которой находится слайд с сфокусированным элементом
  let indexPage = null;

  /*

  Текущий номер слайда делится на количетсво слайдов на странице, а результат округляется вниз.
  Получаем для первой группы = 0, для второй группы = 1, для третий = 2 и т.д.
  Затем это число умножается на количество перелистываемых слайдов за раз.
  В результате получается идекс страницы для swiper'a
  
  */
  if ( activeFocusedIndex % slidesPerPage == 0 && activeFocusedIndex != 0 ) {
    indexPage = ( Math.floor(activeFocusedIndex / slidesPerPage) - 1 ) * swiperObj.params.slidesPerGroup;
  }
  else {
    indexPage = Math.floor(activeFocusedIndex / slidesPerPage) * swiperObj.params.slidesPerGroup;
  }

  swiperObj.slideTo(indexPage);
  currentSwiper.scrollLeft = 0;

  console.log( swiperObj.activeIndex, indexPage)
}

//Переносит элемент description в блоке Gallery
(function() {
  function transferGalleryDescription() {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;

    if (windowWidth < 1024) {
      if ( document.querySelector('.gallery__body .gallery__description') ) {
        document.querySelector('.gallery__container').append( document.querySelector('.gallery__description') );
      }
    }
    else {
      if ( document.querySelector('.gallery__container > .gallery__description') ) {
        document.querySelector('.gallery__body').append( document.querySelector('.gallery__description') );
      }
    }
  }

  //Swiper глючит с троттлингом...
  // transferGalleryDescription = throttle( transferGalleryDescription, 100 );

  transferGalleryDescription();
  window.addEventListener( 'resize', transferGalleryDescription );
})();

//Запускает события для обработки меню
(function() {
  const inputArr = document.querySelectorAll('.search__input[placeholder]');

  inputArr.forEach(i => {
    i.addEventListener('focus', handlerRemovePlaceholderOnFocus);
    i.addEventListener('blur', handlerAddPlaceholderOnBlur);
  });
  menuHandler('.dropdown__button');
  menuHandler('.hamburger');
  menuHandler('.search__close-btn');
})();

//Показывает скрытые слайды
(function (){
  const loadBtn = document.querySelector('.events__load-more');

  function onLoadMore() {
    const slidesArr = document.querySelectorAll('.swiper-events__slide');

    slidesArr.forEach( slide => slide.classList.add('swiper-events__slide--show') );
    loadBtn.style.display = 'none';
  }

  loadBtn.addEventListener( 'click', onLoadMore );
})();

//Swiper-js
(function () {
  //Параметры
  const paramsGallery = {
    slideClass: 'swiper-gallery__slide',
    wrapperClass: 'swiper-gallery__wrapper',

    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
    },

    navigation: {
      nextEl: ".swiper-gallery__button--next",
      prevEl: ".swiper-gallery__button--prev",
      disabledClass: 'swiper-gallery__button--disabled',
    },
    
    a11y: {
      enabled: true,
      notificationClass: 'swiper-gallery__notification',
      firstSlideMessage: 'Это первый слайд',
      lastSlideMessage: 'Это последний слайд',
      nextSlideMessage: 'Следующий слайд',
      prevSlideMessage: 'Предыдущий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
    },

    breakpoints: {
      580: {
        slidesPerColumn: 2,
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 15,
      },
      768: {
        slidesPerColumn: 2,
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 34,
      },
      1600: {
        slidesPerColumn: 2,
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 50
      }
    },
  };
  const paramsEvents = {
    spaceBetween: 15,
    slideClass: 'swiper-events__slide',
    wrapperClass: 'swiper-events__wrapper',

    pagination: {
      el: ".pagination-swiper-events",
      type: 'bullets',
      bulletClass: 'pagination-swiper-events__bullet',
      bulletActiveClass: 'pagination-swiper-events__bullet--active',
    },
    
    a11y: {
      enabled: true,
      notificationClass: 'swiper-events__notification',
      firstSlideMessage: 'Это первый слайд',
      lastSlideMessage: 'Это последний слайд',
      nextSlideMessage: 'Следующий слайд',
      prevSlideMessage: 'Предыдущий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
    },
  };
  const paramsPublications = {
    slideClass: 'swiper-publications__slide',
    wrapperClass: 'swiper-publications__wrapper',

    navigation: {
      nextEl: '.navigation-swiper-publications__button--next',
      prevEl: '.navigation-swiper-publications__button--prev',
      disabledClass: 'navigation-swiper-publications__button--disabled'
    },

    pagination: {
      el: '.navigation-swiper-publications__pagination',
      type: 'fraction',
    },

    a11y: {
      enabled: true,
      notificationClass: 'swiper-publications__notification',
      firstSlideMessage: 'Это первый слайд',
      lastSlideMessage: 'Это последний слайд',
      nextSlideMessage: 'Следующий слайд',
      prevSlideMessage: 'Предыдущий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
    },

    breakpoints: {
      768: {
        spaceBetween: 34,
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      1024: {
        spaceBetween: 49,
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      1600: {
        spaceBetween: 50,
        slidesPerView: 3,
        slidesPerGroup: 3,
      }
    },
  };
  const paramsProjects = {
    spaceBetween: 47,
    slideClass: 'swiper-projects__slide',
    wrapperClass: 'swiper-projects__wrapper',

    navigation: {
      nextEl: '.navigation-swiper-projects__button--next',
      prevEl: '.navigation-swiper-projects__button--prev',
      disabledClass: 'navigation-swiper-projects__button--disabled'
    },

    a11y: {
      enabled: true,
      notificationClass: 'swiper-projects__notification',
      firstSlideMessage: 'Это первый слайд',
      lastSlideMessage: 'Это последний слайд',
      nextSlideMessage: 'Следующий слайд',
      prevSlideMessage: 'Предыдущий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
    },

    breakpoints: {
      580: {
        spaceBetween: 34,
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      1024: {
        spaceBetween: 50,
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      1300: {
        spaceBetween: 50,
        slidesPerView: 3,
        slidesPerGroup: 3,
      }
    }
  };

  //Объекты
  let swiperGallery = new Swiper( '.swiper-gallery', paramsGallery );
  let swiperEvents;
  let swiperPublications;
  let swiperProjects = new Swiper( '.swiper-projects', paramsProjects );

  //Массив объектов
  let swiper = {
    gallery: swiperGallery,
    events: swiperEvents,
    publications: swiperPublications,
    projects: swiperProjects,
  };

  //Подключается к каждому :focus внутри каждого swiper
  function onFocusSlide(e) {
    //DOM элемент слайдера, в котором произошло событие 'focus'
    const swiperElem = e.target.closest('.swiper');
    //Объект слайдера, в котором произошло событие 'focus'
    let swiperObj;

    for (let s in swiper) {
      if ( !swiper[s] ) continue;
      if ( swiperElem.className.includes( swiper[s].params.el.replace('.', '') ) ) swiperObj = swiper[s];
    }

    if ( !swiperObj ) return;

    //Ссылка на слайдер, в котором произошло событие 'focus'
    const slide = e.target.closest( '.' + swiperObj.params.slideClass );
    //Номер слайдера, в котором произошло событие 'focus'
    const focusIndex = parseInt( slide.getAttribute('aria-label').split('/')[0], 10 ) - 1;
    //Индекс активного слайда
    const activeIndex = swiperObj.activeIndex;
    //Количество слайдов в одной строке слайдера
    const slidesPerView = swiperObj.params.slidesPerView;
    //Количество строк в слайдере
    const rows = swiperObj.params.slidesPerColumn ? swiperObj.params.slidesPerColumn : 1;
    //Количество отображаемых слайдов на странице
    const displayedSlides = slidesPerView * rows;
    //Индекс слайда (страницы, если слайдов в строке больше 1), в котором произошло событие 'focus'
    //В swiper, индекс слайда (страницы) складывается с количество слайдов в строке
    //Если в строке 1 слайд, то индексы у слайдов будут 0, 1, 2, 3 и т. д.
    //Если в строке 3 слайда, то индексы у слайдов (страниц) будут 0, 3, 6, 9 и т. д.
    const newIndex = Math.trunc( focusIndex / displayedSlides ) * slidesPerView;
    
    //Если :focus находится не в активном слайде, то изменить активный слайд
    if (newIndex !== activeIndex) {
      swiperObj.slideTo(newIndex);
      swiperElem.scrollLeft = 0;
    }
  }
  
  //Получить все элементы с :focus внутри слайдеров и подключить колбэеки к событиям
  document.querySelectorAll('.swiper').forEach( s => {
    const container = s.querySelector('[class*="wrapper"]');
    const focusables = container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex="0"]');

    focusables.forEach( f => { f.addEventListener( 'focus', onFocusSlide ) } );
  } );

  //Управляет работой слайдера в зависимости от ширины экрана
  function onResizeSwiperEvents() {
    if ( document.documentElement.clientWidth < 768 && !swiperEvents ) {
      swiperEvents = new Swiper( '.swiper-events', paramsEvents );
      swiper.events = swiperEvents;
    } else if ( document.documentElement.clientWidth >= 768 && swiperEvents ) {
      swiperEvents.destroy();
      swiperEvents = null;
      swiper.events = null;
    }
  }
  //Управляет работой слайдера в зависимости от ширины экрана
  function onResizeSwiperPublications() {
    if ( document.documentElement.clientWidth >= 768 && !swiperPublications ) {
      swiperPublications = new Swiper( '.swiper-publications', paramsPublications );
      swiper.publications = swiperPublications;
    } else if (  document.documentElement.clientWidth < 768 && swiperPublications ) {
      swiperPublications.destroy();
      swiperPublications = null;
      swiper.publications = null;
    }
  }

  onResizeSwiperEvents();
  onResizeSwiperPublications();
  window.addEventListener( 'resize', onResizeSwiperEvents );
  window.addEventListener( 'resize', onResizeSwiperPublications );
}());

//Choices-js
(function() {
  const element = document.querySelector('.js-choice');
  new Choices(element, {
    silent: true,
    searchEnabled: false
  });
})();

//Tabby
(function() {
  new Tabby('[data-country-tabs]');
  new Tabby('[data-artist-tabs]');

  function scrollToAnchor() {
    const anchor = this.getAttribute('href');
    const elem = document.querySelector(anchor);

    elem.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function onTabbyCountries(e) {
    //Только для вкладок выбора языка
    if ( !e.target.closest('[data-artist-tabs]') ) return

    const tab = e.target;
    const content = e.detail.content;
    const previousContent = e.detail.previousContent;
    
    //Если панель таба пустая, то добавить заглушку
    if (content.childNodes.length === 0) {
      const wrap = document.createElement('div');
      const image = document.createElement('img');
      const name = document.createElement('h4');
      const title = document.createElement('h3');
      const text = document.createElement('p');
      const link = document.createElement('a');

      wrap.className = 'artists-catalog__image-wrap artists-catalog__image-wrap--unknown-artist';
      image.className = 'artists-catalog__unknown-artist-image';
      image.setAttribute('src', 'img/unknown-artist.svg');
      image.setAttribute('alt', 'Изображение художника');
      name.className = 'artists-catalog__unknown-artist-name';
      name.innerHTML = 'Х - Художник';
      title.className = 'title title--size--sm title--weight--semibold artists-catalog__title artists-catalog__title--unknown-artist';
      title.innerHTML = 'Что мы о нём знаем?';
      text.className = 'artists-catalog__text artists-catalog__text--unknown-artist';
      text.innerHTML = 'Пока ничего... Зато мы точно знаем, что в галерее есть на что посмотреть!';
      link.className = 'link link--inline artists-catalog__gallery-link';
      link.setAttribute('href', '#gallery');
      link.innerHTML = 'В галерею';

      content.append(wrap, image, name, title, text, link);
      wrap.append(image, name);
    }

    //Очистить предыдущую панель если там была заглушка
    if ( previousContent && previousContent.querySelector('.artists-catalog__image-wrap--unknown-artist') ) {
      previousContent.innerHTML = '';
    }
  }

  document.addEventListener('tabby', onTabbyCountries, false);
  document.querySelector('[data-artist-tabs]').querySelectorAll('a').forEach( a => a.addEventListener( 'click', scrollToAnchor ) );
})();

//Accordion-js (catalog)
(function() {
  const acArr = document.querySelectorAll('.catalog__accordion-container');
  const options = {
    duration: 150,
    openOnInit: [0],
    elementClass: 'accordion-catalog',
    triggerClass: 'accordion-catalog__trigger',
    panelClass: 'accordion-catalog__panel',
    activeClass: 'accordion-catalog--active',
  };

  acArr.forEach( a => new Accordion(a, options) );
})();

//Accordion-js (publication)
(function() {
  let accordion;
  const selector = document.querySelector('.accordion-publications');
  const options = {
    duration: 250,
    openOnInit: [],
    elementClass: 'accordion-publications__item',
    triggerClass: 'accordion-publications__trigger',
    panelClass: 'accordion-publications__panel',
    activeClass: 'accordion-publications--active',
  };
  let accordionPublicationListener = (function () {
    //Сохранить в замыкании
    const triggerButton = document.querySelector('.' + options.triggerClass);

    return function () {
      if ( window.matchMedia('(max-width: 767px)').matches ) {
        if ( !accordion ) {
          accordion =  new Accordion(selector, options);
          //Включить :focus у кнопки раскрытия элемента
          triggerButton.removeAttribute('disabled');
        }
      }
      else {
        if ( selector.querySelector('.js-enabled') && accordion) {
          accordion.destroy();
          accordion = null;
        }
        
        if ( !triggerButton.hasAttribute('disabled') ) {
          //Отключить :focus у кнопки раскрытия элемента
          triggerButton.setAttribute('disabled', '');
        }
      }
    }
  })();

  accordionPublicationListener();
  window.addEventListener( 'resize', () => accordionPublicationListener() );
})();

//Tippy-js
(function() {
  const params = {
    theme: 'brand',
    maxWidth: 264,
  };
  const tooltipArr = document.querySelectorAll('.tooltip');

  tooltipArr.forEach( tooltip => {
    params.content = tooltip.dataset.tippyContent;
    tippy(tooltip, params);
  } );
})();

//Yandex Maps
(function() {
  function lazyloadYMaps() {
    const ymapOffset = document.querySelector('.contacts').offsetTop;

    if ( window.scrollY >= ymapOffset - 500 ) {
      ymaps.ready(init);
      function init(){
  
          // Создание карты.
          var myMap = new ymaps.Map("contacts-ymap", {
              // Координаты центра карты.
              // Порядок по умолчанию: «широта, долгота».
              // Чтобы не определять координаты центра карты вручную,
              // воспользуйтесь инструментом Определение координат.
              center: [55.75846806898367, 37.60108849999989],
              // Уровень масштабирования. Допустимые значения:
              // от 0 (весь мир) до 19.
              controls: [],
              zoom: 14
          });
  
          var myPlacemark = new ymaps.Placemark([55.75846806898367, 37.60108849999989], {}, {
            iconLayout: 'default#image',
            iconImageHref: '../img/yandex-map-icon.svg',
            iconImageSize: [20, 20],
            iconImageOffset: [-10, -20]
        });
  
        myMap.geoObjects.add(myPlacemark); 
        MYAPP.ymaps = myMap;

        desctopControls();
        window.addEventListener( 'resize', desctopControls );
      }

    window.removeEventListener('scroll', lazyloadYMaps);
    } else {
      window.addEventListener('scroll', lazyloadYMaps);
    }
  }
  //Добавляет кнопку геолокации и масштаба для десктопа
  function desctopControls() {
    const clientWidth = document.documentElement.clientWidth;

    if ( clientWidth < 1600 ) {
      if ( MYAPP.ymaps.controls.get('geolocationControl') ) {
        MYAPP.ymaps.controls.remove('geolocationControl');
        MYAPP.ymaps.controls.remove('zoomControl');
      }
    } else {
      if ( !MYAPP.ymaps.controls.get('geolocationControl') ) {
        MYAPP.ymaps.controls.add('geolocationControl', {
          size: "large",
          position:  { top: "353px", right: "10px" },
          float: 'none',
        });
        MYAPP.ymaps.controls.add('zoomControl', {
          size: "small",
          float: "none",
          position: { top: "261px", right: "10px" }
        });
      }
    }
  }

  lazyloadYMaps();
})();

//just-validate.js
(function() {
  const validators = {
    phone: str => validator.isMobilePhone(str.replace(/\s+/g, ''), 'any', {strictMode: true}),
    required: str => !validator.isEmpty(str),
  };
  const messages = {
    phone: 'Ожидается формат: +7 999 999 99 99',
    required: 'Отсутствует значение',
  }
  const createMessage = function(str) {
    let span = document.createElement('span');
    let text = document.createTextNode(str);

    span.append(text);
    span.classList.add('invalid-message');
    return span;
  };

  //Отправляет почту с помощью PHPMailer
  function sendEmail() {
    let form = document.querySelector('.form-body-contacts');
    let formData = new FormData(form);
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if ( xhr.readyState === 4 ) {
        if ( xhr.status === 200 ) {
          console.log('Отправлено');
        }
      }
    };

    xhr.open( 'POST', 'php/mail.php', true );
    xhr.send( formData );
    
    form.reset();
  }

  function toValidate(selector) {
    const form = document.querySelector(selector);
    const inputArr = Array.from( form.querySelectorAll('input') );
    const submitBtn = form.querySelector('[type="submit"');

    submitBtn.addEventListener( 'click', e => {
      inputArr.forEach( input => {
        const ruleArr = input.dataset.validator.split(' ');

        ruleArr.forEach( rule => {
          if ( validators[rule](input.value) === false ) {
            input.classList.add('invalid-input');

            if ( !input.previousElementSibling.classList.contains('invalid-message') ) {
              input.before( createMessage( messages[rule] ) );
            }

            return;
          } else {
            input.classList.remove('invalid-input');

            if ( input.previousElementSibling.classList.contains('invalid-message') ) {
              input.previousElementSibling.remove();
            }
          }
        } );
      } );

      MYAPP.ymaps.container.fitToViewport();
      
      if ( !document.querySelector('.invalid-input') ) {
        // const name = document.querySelector('.form-body-contacts__input[name=name]').value;
        // const phone = document.querySelector('.form-body-contacts__input[name=phone]').value;
        // const date = ( new Date() ).toLocaleString();
        // const body = `Здравствуйте! Меня зовут ${name}, Я хочу сделать заказ. Мой номер телефона: ${phone}`;

        // window.open(`mailto:test@example.com?subject=Заказ от ${date}&body=${body}`);

        sendEmail();
      }

      e.preventDefault();
    } );
  }

  toValidate('.form-body-contacts');
})();

//Modal window
(function() {
  function ModalWindow() {
    // === Параметры
    this.params = {
      modalClass: '.modal',
      contentClass: '.modal__content',
      imageWrapClass: '.content-modal__image-wrap',
      authorClass: '.content-modal__author',
      titleClass: '.content-modal__title',
      dateClass: '.content-modal__date',
      descriptionClass: '.content-modal__description',
      closeClass: '.modal__close',
    }

    // === Элементы DOM
    this.modal = document.querySelector( this.params.modalClass );
    this.content = document.querySelector( this.params.contentClass );
    this.imageWrap = document.querySelector( this.params.imageWrapClass );
    this.author = document.querySelector( this.params.authorClass );
    this.title = document.querySelector( this.params.titleClass );
    this.date = document.querySelector( this.params.dateClass );
    this.description = document.querySelector( this.params.descriptionClass );
    this.close = document.querySelector( this.params.closeClass );
    this.imageContainerArr = document.querySelectorAll('.swiper-gallery__image-wrap');
    this.body = document.querySelector('body');
    this.image = null;

    // === Методы

    //
    this.openModal = function(e) {
      //
      if ( e.key && e.key !== 'Enter' ) return
      
      //
      this.isClosed = false;
      //
      let targetImage = e.target.querySelector('picture');
      
      //
      this.modal.style.display = 'block';
      this.body.style.overflow = 'hidden';    
      this.description.innerHTML = targetImage.dataset.modalDescription;

      //
      let image = this.loadImage( {
        src: targetImage.dataset.modalSrc,
        className: 'content-modal__image',
        alt: 'Изображение картины в высоком разрешении',
        callback: function() {
          this.imageWrap.style.filter = '';
        }.bind(this),
      } );

      this.author.innerHTML = targetImage.dataset.modalAuthor;
      this.title.innerHTML = targetImage.dataset.modalTitle;
      this.date.innerHTML = targetImage.dataset.modalDate;
      this.imageWrap.append( image );

      //
      this.previousFocusEl = document.activeElement;
      this.cleanUpFocusTrap = this.focusTrap( this.modal );
    };

    //
    this.loadImage = function( params ) {
      let image = document.createElement('img');

      image.src = params.src;
      image.className = params.className;
      image.alt = params.alt;
      image.onload = () => params.callback( image );

      return image;
    };
    
    //
    this.closeModal = function() {
      this.modal.style.display = 'none';
      this.body.style.overflow = 'auto';
      this.cleanUpFocusTrap();
      this.previousFocusEl.focus();
      this.previousFocusEl = null;

      this.imageWrap.querySelector('img').remove();
      this.author.innerHTML = '';
      this.title.innerHTML = '';
      this.date.innerHTML = '';
    };

    //
    this.focusTrap = function(el) {
      const focusableEls = el.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
      const firstFocusableEl = focusableEls[0];  
      const lastFocusableEl = focusableEls[focusableEls.length - 1];
      const KEYCODE_TAB = 9;
      let keyboardHandler;

      
      keyboardHandler = function(e) {
        if (e.key === 'Tab' || e.keyCode === KEYCODE_TAB) {
          if ( e.shiftKey ) /* shift + tab */ {
            if (document.activeElement === firstFocusableEl) {
              lastFocusableEl.focus();
              e.preventDefault();
            }
          } else /* tab */ {
            if (document.activeElement === lastFocusableEl) {
              firstFocusableEl.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      el.addEventListener( 'keydown', keyboardHandler );
      
      // ???? Почему-то без таймаута не работает
      // ???? 
      setTimeout( () => firstFocusableEl.focus() );

      return function cleanUp() {
        if (keyboardHandler) {
          el.removeEventListener( 'keydown', keyboardHandler );
        }
      };
    }

    // === Состояние
    this.cleanUpFocusTrap;
    this.previousFocusEl;
    this.isClosed;

    // === Запуск
    for (let i = 0; i < this.imageContainerArr.length; i += 1) {
      this.imageContainerArr[i].addEventListener( 'click', this.openModal.bind(this) );
      this.imageContainerArr[i].addEventListener( 'keydown', this.openModal.bind(this) );
    }
  
    this.close.addEventListener( 'click', this.closeModal.bind(this) );
  };

  new ModalWindow();
})();

//"Publications" Переносит чекбоксы из формы и обратно, при нажатии на них
(function() {
  const accPublications = document.querySelector('.accordion-publications');
  const form = document.querySelector('.form-publications');

  //Сортирует label'ы
  function sortLabel(form) {
    let sortedInputArr = Array.from( form.querySelectorAll('label') ).sort( compare );

    for ( let i = 0; i < sortedInputArr.length; i++ ) {
      form.append( sortedInputArr[i] );
    }
  }

  //Обработчик события
  function onClickChoices(e) {
    //Только для мобильной версии

    if ( document.documentElement.clientWidth >= 768 ) return

    const targetElem = e.target.closest('label');

    //Если внутри формы
    if ( targetElem.closest('form') ) {
      accPublications.after(targetElem);
    } else {
      form.append(targetElem);

      sortLabel(form);
    }
  }

  //Функция сортировки
  function compare(a, b) {
    let v1 = +a.dataset.sort,
        v2 = +b.dataset.sort;

    if ( v1 < v2 ) return -1;
    if ( v1 > v2 ) return 1;
    if ( v1 === v2 ) return 0;
  }

  //Подключить обработчики событий
  form.querySelectorAll('input').forEach( input => input.addEventListener( 'click', onClickChoices ) );

  //Переносит чекбоксы в зависимости от ширины экрана
  window.addEventListener( 'resize', e => {
    const labelArr = Array.from( document.querySelectorAll('label.form-publications__check') );

    if ( document.documentElement.clientWidth >= 768 ) {
      for (let i = 0; i < labelArr.length; i++) {
        if ( labelArr[i].querySelector('input').checked && !labelArr[i].closest('form') ) {
          form.append( labelArr[i] );
        }
      }
    } else {
      for (let i = 0; i < labelArr.length; i++) {
        if ( labelArr[i].querySelector('input').checked && labelArr[i].closest('form') ) {
          accPublications.append( labelArr[i] );
        }
      }
    }

    sortLabel(form);
  } );
})();