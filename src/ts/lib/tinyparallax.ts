export default class TinyParallax{

	constructor(selector:string){

		window.addEventListener('scroll', (e:Event) => {

			document.querySelectorAll(selector).forEach((el:HTMLElement) => {
				$(el).css("background-position", 'center '+(($(el).offset().top+($(el).height()/2)-$(window).scrollTop())/$(window).height()*100)+'%');
			})
		})
	}
}