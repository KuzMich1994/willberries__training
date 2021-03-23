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
			document.body.style.cssText = `overflow-y: hidden; padding-right: 18px;`;
		}
		if (target.matches('.overlay') || target.matches('.modal-close')) {
			modalCart.classList.remove('show');
			document.body.style.cssText = `overflow-y: visible; padding-right: 0;`;
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
				console.log(target);
				let w = window.pageYOffset - 1;
				let hash = target.href.replace(/[^#]*(.*)/, '$1');
				let t = document.querySelector(hash).getBoundingClientRect().top;
				let start = null;
				const step = time => {
					if (start === null) {
						start = time;
					}
					let progress = time - start;
					let r = (t < 0 ? Math.max(w - progress / v, v + t) : Math.min(w + progress / v, w + t));
					if (r < -100) {
						console.log(r);
						return;
					}
					console.log(r);
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



