const canvas = document.querySelector('#stage');


let tl = gsap.timeline();

tl.to('.banner-img', { duration: 3, scale: 0.5 })
tl.fromTo('.cta-wrapper',  {x: 0, opacity:0}, {duration: 2.5, x: 140, opacity:1, ease: "power4.out", display: 'flex'}, "=-0.5" ) 


  // start.add(TweenMax.fromTo( $(".reveal") , 1 ,{opacity:0}, {opacity:1, ease: Expo.easeInOut} ), "=-0.5") ;