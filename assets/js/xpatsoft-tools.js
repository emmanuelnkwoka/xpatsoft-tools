(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var search = document.getElementById('xpatsoft-search');
    var cards = document.querySelectorAll('#xpatsoft-directory .xpatsoft-card');
    var filters = document.querySelectorAll('.xpatsoft-filter');
    var activeCat = 'all';
    function apply(){
      var q = (search ? search.value.toLowerCase() : '');
      cards.forEach(function(c){
        var cat = c.getAttribute('data-cat') || '';
        var hay = c.getAttribute('data-search') || '';
        var show = (activeCat==='all' || cat===activeCat) && (!q || hay.indexOf(q)!==-1);
        c.style.display = show ? '' : 'none';
      });
    }
    if(search) search.addEventListener('input', apply);
    filters.forEach(function(b){
      b.addEventListener('click', function(){
        filters.forEach(function(x){x.classList.remove('is-active');});
        b.classList.add('is-active');
        activeCat = b.getAttribute('data-cat');
        apply();
      });
    });
  });
})();
