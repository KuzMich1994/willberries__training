const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart

const showModalCart = foo => {
	const modalCart = document.getElementById('modal-cart');

	document.addEventListener('click', e => {
		const target = e.target;

		if (target.closest('.button-cart')) {
			foo.initInOpenModal();
			modalCart.classList.add('show');
			document.body.classList.add('scroll-hidden');
		}
		if (target.matches('.overlay') || target.matches('.modal-close')) {
			modalCart.classList.remove('show');
			document.body.classList.remove('scroll-hidden');
		}
	});
};

// getGoods

const getGoods = async () => {
		const result = await fetch('db/db.json');

		if (!result.ok) {
			throw new Error(`Error: ${result.status}`);
		}
		return await result.json();
	};

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
	const longGoodsList = document.querySelector('.long-goods-list');


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
			.then(data => data.filter(good => good[filed] === value))
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

// calcSum

class CalcSum {
	constructor(cartTableGoods, cartTableTotal) {
		this.cartTableGoods = document.querySelector(cartTableGoods);
		this.cartTableTotal = document.querySelector(cartTableTotal);
		this.cartGoods = [];
	}
	renderCart() {
		this.cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count}) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;
			
			trGood.innerHTML = `
				<td>${name}</td>
					<td>${price}$</td>
					<td><button class="cart-btn-minus">-</button></td>
					<td class="count">${count}</td>
					<td><button class="cart-btn-plus">+</button></td>
					<td>${price * count}$</td>
					<td><button class="cart-btn-delete">x</button></td>
			`;

			this.cartTableGoods.append(trGood);
		});
		
		const total = this.cartGoods.reduce((sum, item) => {
			return sum + (item.price * item.count);
		}, 0);
		this.cartTableTotal.textContent = `${total}$`;
	}

	addListenerTable() {
		this.cartTableGoods.addEventListener('click', e => {
			const target = e.target;

			if (target.tagName === 'BUTTON') {
				const id = target.closest('.cart-item').dataset.id;

				if (target.matches('.cart-btn-delete')) {
					this.deleteGood(id);
				}
				if (target.matches('.cart-btn-minus')) {
					this.minusGood(id);
				}
				if (target.matches('.cart-btn-plus')) {
					this.plusGood(id);
				}
			}
		});
	}

	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
		this.updateCounter();
	}
	
	minusGood(id) {
		this.cartGoods.forEach(item => {
			if (item.id === id) {
				item.count--;
				if (item.count < 1) {
					this.deleteGood(item.id);
				}
			}
		});
		this.renderCart();
		this.updateCounter();
	}
	
	plusGood(id) {
		this.cartGoods.forEach(item => {
			if (item.id === id) {
				item.count++;
			}
		});
		this.renderCart();
		this.updateCounter();
	}
	
	addCartGoods(id) {
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1
					});
					// this.renderCart();
					this.updateCounter();
				});
		}
	}

	updateCounter() {
		const cartCount = document.querySelector('.cart-count');
		const counter = this.cartGoods.reduce((sum, item) => {
			return sum + item.count;
		}, 0);

		cartCount.textContent = counter;
		if (counter < 1) {
			cartCount.textContent = '';
		}
	}

	addListenerBody() {
		document.body.addEventListener('click', e => {
			const target = e.target;
			
			if (target.closest('.add-to-cart')) {
				const id = target.closest('.add-to-cart').dataset.id;
				this.addCartGoods(id);
				this.updateCounter();
			}
		});
	}
	
	init() {
		this.addListenerBody();
		this.addListenerTable();
	}
	initInOpenModal() {
		this.renderCart();
	}

}

const calcSum = new CalcSum('.cart-table__goods', '.card-table__total');

showModalCart(calcSum);
calcSum.init();


