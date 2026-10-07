(() => {
  // Remove <style> tags and external stylesheets
  document
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach(el => el.remove());

  // Remove inline CSS: style="..."
  document
    .querySelectorAll('[style]')
    .forEach(el => el.removeAttribute('style'));

  // Remove constructable/adopted stylesheets, if used
 // if ('adoptedStyleSheets' in document) {
 //   document.adoptedStyleSheets = [];
 // }

  // Inject your CSS
  const style = document.createElement('style');

  style.textContent = `
    /* YOUR CSS HERE */

    



body {
    background: lightgray;
  
  
    font-size: 1rem;  
    font-family: "Helvetica Neue", Helvetica, Verdana, sans-serif;
  
    line-height: 1.55;
    padding: 1rem;
  
                -webkit-font-smoothing: antialiased; /* learned from bbc.co.uk */

  

}



img {
    width: auto !important;
    height: auto !important;
    max-width: 60px;
}


 img:active 
/*  img:hover */ 

{

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: auto;
  height: auto;
  max-width: 90vw;
  max-height: 90vh;

  z-index: 9999;

    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.6);
}






h1 {
  color: sienna;
    font-size: 1.5rem;
}






blockquote {
  border-left: 2px solid #999;
  padding-left: 1rem;
}




 

svg {
  display: none ;
}




h1::before,
h2::before,
h3::before {
  content: "";
  display: block;
  width: 100%;
  margin-bottom: 0.25em;
}

h1::before {
  border-top: 3px solid #000;
}

h2::before {
  border-top: 3px dashed #000;
}

h3::before {
  border-top: 3px dotted #000;
}


/* .article { */
/*    columns: 2;  Splits the text into 2 equal columns */
/*      break-inside: avoid;  Keeps each article intact as a single block */
/* } */





/* Modern, softer link colors */
a {
  color: #2563eb;          /* calm blue */
  text-decoration: none;
}

a:hover,
a:focus-visible {
  color: #1d4ed8;
  text-decoration: underline;
}

a:visited {
  color: #7c5aa6;          /* muted purple */
}

a:visited:hover,
a:visited:focus-visible {
  color: #67458f;
}

/* Place :visited after the default a rule so it overrides the normal link color */






pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background: #242424;
  color: #eee;
  border-radius: 4px;
}


pre code {
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}




    


  `;

  document.head.appendChild(style);

  console.log('Original CSS removed and custom CSS injected.');
})();