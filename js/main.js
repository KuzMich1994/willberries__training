const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart

const showModalCart = () => {
	const modalCart = document.getElementById('modal-cart');

	document.addEventListener('click', e => {
		const target = e.target;

		if (target.closest('.button-cart')) {
			modalCart.classList.add('show');
			document.body.classList.add('scroll-hidden');
		}
		if (target.matches('.overlay') || target.matches('.modal-close')) {
			modalCart.classList.remove('show');
			document.body.classList.remove('scroll-hidden');
		}
	});
};

showModalCart();

// scrollToAnchors

const scrollToAnchors = () => {
	const anchors = document.querySelectorAll('[href^="#"]');
	let v = 0.3;

	anchors.forEach(item => {
		item.addEventListener('click', e => {
			e.preventDefault();
			let target = e.target;
			if (target.closest('[href*="#"]')) {
				target = target.closest('[href*="#"]');
				let w = window.pageYOffset;
				let hash = target.href.replace(/[^#]*(.*)/, '$1');
				if (hash === '#') {
					return;
				}
				let t = document.querySelector(hash).getBoundingClientRect().top;
				let start = null;
				const step = time => {
					if (start === null) {
						start = time;
					}
					let progress = time - start;
					let r = (t < 0 ? Math.max(w - progress / v, v + t) : Math.min(w + progress / v, w + t));
					if (r < -100) {
						return;
					}
					window.scrollTo(0, r);

					if (r !== w + t) {
						requestAnimationFrame(step);
					} else {
						location.hash = hash;
					}
				};
				requestAnimationFrame(step);
			}

		}, false);
	});
};

scrollToAnchors();

const showGoods = () => {
	const more = document.querySelector('.more');
	const navigation = document.querySelector('.navigation');
	const longGoodsList = document.querySelector('.long-goods-list');

	const getGoods = async () => {
		const result = await fetch('db/db.json');

		if (!result.ok) {
			throw new Error(`Error: ${result.status}`);
		}
		return await result.json();
	};

	const createCard = objCard => {
		const newCard = document.createElement('div');
		newCard.className = 'col-lg-3 col-sm-6';

		newCard.innerHTML = `
			<div class="goods-card">
				${objCard.label ? 
					`<span class="label">${objCard.label}</span>` :
					''}
				<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
				<h3 class="goods-title">${objCard.name}</h3>
				<p class="goods-description">${objCard.description}</p>
				<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
					<span class="button-price">$${objCard.price}</span>
				</button>
			</div>
		`
		return newCard;
	};

	const renderCards = data => {
		longGoodsList.textContent = '';
		const cards = data.map(createCard);
		longGoodsList.append(...cards);

		document.body.classList.add('show-goods');
	};

	const filterCards = (filed, value) => {
		getGoods()
			.then((data) => {
				const filteredGoods = data.filter((good) => {
					return good[filed] === value;
				});
				return filteredGoods;
			})
			.then(renderCards);
	};

	document.addEventListener('click', e => {
		const target = e.target;

		if (target.matches('.navigation-link')) {
			e.preventDefault();
			filterCards(target.dataset.field, target.textContent);
		}
		if (target.textContent === 'All' || target.matches('.more')) {
			e.preventDefault();
			getGoods().then(renderCards);
		}
		if (target.closest('.accessories')) {
			filterCards('category', 'Accessories');
			document.getElementById('body').scrollIntoView({
				block: 'start',
				behavior: 'smooth'
			})
		}
		if (target.closest('.clothing')) {
			filterCards('category', 'Clothing');
			document.getElementById('body').scrollIntoView({
				block: 'start',
				behavior: 'smooth'
			})
		}
	});
};

showGoods();



