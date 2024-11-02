import Lazy from "vanilla-lazyload";
import * as M from "materialize-css";
import Swiper from "swiper";
import { Grid, Pagination, Navigation } from "swiper/modules";
import TinyParallax from "./lib/tinyparallax";
import mapboxgl from "mapbox-gl";

Swiper.use([Grid, Navigation, Pagination]);

let timelineInSight: boolean = false;
let map: any;

(() => {
	const lazy = new Lazy({}, document.querySelectorAll(".lazy"));
	const sidenav = M.Sidenav.init(document.querySelectorAll(".sidenav"));
	const parallax = new TinyParallax("#parallax");
	const tabsExists = document.querySelectorAll(".tabs").length > 0;
	const serviceSliderExists = document.querySelectorAll("#service-slider").length > 0;
	const timelineExists: boolean = document.querySelectorAll("#timeline").length > 0;

	if (serviceSliderExists) {
		const serviceSlider = new Swiper("#service-slider", {
			grid: {
				rows: 2,
				fill: "row",
			},
			navigation: {
				nextEl: ".next",
				prevEl: ".prev",
			},
			pagination: {
				el: "#service-pagination",
				type: "fraction",
			},
			slidesPerView: 3,
			slidesPerGroup: 3,
			spaceBetween: 20,
		});
	}

	if (tabsExists) {
		const tabs = M.Tabs.init(document.querySelectorAll(".tabs"));
	}

	if (timelineExists) {
		let observer: IntersectionObserver = new IntersectionObserver(timlineObserveCallback, {
			threshold: 0.8, // 80%
		});
		observer.observe(document.querySelector("#timeline"));
	}

	if (timelineExists) {
		document.addEventListener("wheel", timelineScroller, {
			passive: false,
		});
	}
	window.addEventListener("resize", toggleMapZoom);

	initMap();
	toggleMapZoom();

	$("body").on("click", ".tab-next", tabScrollRight);
	$("body").on("click", ".tab-prev", tabScrollLeft);
	$("body").on("click", ".scroll-link", scrollToSection);

	updateHeader();
})();

function scrollToSection(e: JQuery.ClickEvent) {
	e.preventDefault();
	const target = $(e.target).attr("href");
	const $targetEl = $(target);
	const top = $targetEl.offset().top - 100;
	$("html, body").animate(
		{
			scrollTop: top,
		},
		500
	);
}

function tabScrollLeft(e: JQuery.ClickEvent) {
	e.preventDefault();
	let tabWrapper = $(e.currentTarget).parent().find(".tabs")[0];
	tabWrapper.style.scrollBehavior = "smooth";
	tabWrapper.scrollLeft -= 300;
}

function tabScrollRight(e: JQuery.ClickEvent) {
	e.preventDefault();
	let tabWrapper = $(e.currentTarget).parent().find(".tabs")[0];
	tabWrapper.style.scrollBehavior = "smooth";
	tabWrapper.scrollLeft += 300;
}

function toggleMapZoom() {
	const mapExists = document.querySelectorAll("#map").length > 0;

	document.querySelectorAll(".tabs-wrapper").forEach((element) => {
		const wrapper = element as HTMLElement;
		const tabs = wrapper.querySelector(".tabs") as HTMLElement;
		if (tabs.clientWidth < tabs.scrollWidth) {
			wrapper.querySelector(".tab-prev")?.classList.add("visible");
			wrapper.querySelector(".tab-next")?.classList.add("visible");
		} else {
			wrapper.querySelector(".tab-prev")?.classList.remove("visible");
			wrapper.querySelector(".tab-next")?.classList.remove("visible");
		}
	});

	if (mapExists) {
		if (window.innerWidth >= 850) {
			map.scrollZoom.enable();
		} else {
			map.scrollZoom.disable();
		}
	}
}

function timelineScroller(e: WheelEvent) {
	const timeline = document.querySelector("#timeline");
	const timelineReachesEnd: boolean =
		Math.round(timeline.scrollLeft + window.innerWidth) == Math.round(timeline.scrollWidth);

	if (timelineInSight) {
		// Скролл вниз
		if (e.deltaY > 0 && !timelineReachesEnd) {
			e.preventDefault();
			timeline.scrollLeft += e.deltaY * 5;
		}
		// Скролл вверх
		if (e.deltaY < 0 && timeline.scrollLeft > 0) {
			e.preventDefault();
			timeline.scrollLeft += e.deltaY * 5;
		}
	}
}

function timlineObserveCallback(entries: IntersectionObserverEntry[]) {
	let entry: IntersectionObserverEntry = entries[0];
	if (entry.isIntersecting) {
		timelineInSight = true;
	} else {
		timelineInSight = false;
	}
	console.log(timelineInSight);
}

function initMap() {
	const mapExists = document.querySelectorAll("#map").length > 0;

	if (!mapExists) return;

	mapboxgl.accessToken = "pk.eyJ1IjoiZ2VuZXN5cyIsImEiOiJjbDhlZGpnMXUxa2VoM3BuMzBocmljZmdiIn0.ips7qa_gfSr299RO_C27bQ";

	map = new mapboxgl.Map({
		container: "map",
		center: [38.96955280542242, 45.06266859256003],
		zoom: 16,
		style: "mapbox://styles/genesys/ckls2dt0l12fj17qxtbz91bqg",
	});

	const markerEl = document.createElement("a");
	markerEl.href =
		"https://yandex.ru/maps/35/krasnodar/?ll=38.972830,45.061834&mode=routes&rtext=~45.062611,38.969797&rtt=auto&ruri=~ymapsbm1://geo?data%3DCgoxNTgxMjU3Nzc0Ej_QoNC-0YHRgdC40Y8sINCa0YDQsNGB0L3QvtC00LDRgCwg0JTQsNC70YzQvdGP0Y8g0YPQu9C40YbQsCwgMjciCg0T4RtCFR5ANEI,&z=16.13";
	markerEl.target = "_blank";
	markerEl.className = "map-marker";
	new mapboxgl.Marker(markerEl).setLngLat(map.getCenter()).addTo(map);
}

function updateHeader() {
	const scrollTop = document.documentElement.scrollTop > 300 ? 300 : document.documentElement.scrollTop;
	const offsetPercent = scrollTop / 300;
	const opacityPercent = 0.7 * offsetPercent;
	const blurPercent = 10 * offsetPercent;

	const header = document.querySelector("header") as HTMLElement;

	header.style.backgroundColor = `rgba(255, 255, 255, ${opacityPercent})`;
	header.style.backdropFilter = `blur(${blurPercent}px)`;

	requestAnimationFrame(updateHeader);
}
