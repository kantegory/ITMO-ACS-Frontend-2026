// Фильтрация каталога: данные отдельно, проверка условий — в catalog-utils.js.
let filterIngredientIds=[];
const catalogPicker=setupIngredientPicker($('#filter-ingredients'),(ids,chips) => {
  filterIngredientIds=ids;
  $('#filter-selected').hidden=ids.length===0;
  $('#filter-selected .selected-chips').innerHTML=chips;
  renderCatalog();
});
function renderCatalog() {
  // Читаем поля, отбираем подходящие рецепты и обновляем список на странице.
  const filters = {
    query: $('#query').value,
    maxMinutes: Number($('#time').value),
    type: $('#type').value,
    difficulty: $('#difficulty').value,
    ingredientIds: filterIngredientIds
  };
  const shown = filterRecipes(allRecipes(), filters);
  const sort=$('#sort').value;
  if(sort==='fast')shown.sort((a,b)=>a.minutes-b.minutes);
  else if(sort==='popular')shown.sort((a,b)=>likesCount(b)-likesCount(a));
  else shown.sort((a,b)=>b.date.localeCompare(a.date));
  $('#recipe-list').innerHTML=recipeRows(shown);
  const last=shown.length%10, lastTwo=shown.length%100;
  const word=last===1&&lastTwo!==11?'рецепт':last>=2&&last<=4&&(lastTwo<12||lastTwo>14)?'рецепта':'рецептов';
  $('#result-count').textContent=shown.length+' '+word;
  $('#empty').hidden=shown.length!==0;
  $('#reset-filters').hidden=!filters.query&&!filters.maxMinutes&&!filters.type&&!filters.difficulty&&filterIngredientIds.length===0;
}
function resetFilters() {
  ['#query','#type','#difficulty'].forEach(selector=>$(selector).value='');
  $('#time').value = '0';
  catalogPicker.clear();
}
$('#search-form').addEventListener('submit',event=>{event.preventDefault();renderCatalog();});
$('#query').addEventListener('input',renderCatalog);
['#time','#type','#difficulty','#sort'].forEach(selector=>$(selector).addEventListener('change',renderCatalog));
$('#reset-filters').addEventListener('click',resetFilters);
$('[data-reset-filters]').addEventListener('click',resetFilters);
$('#filter-selected').addEventListener('click',event=>{const button=event.target.closest('[data-remove-ingredient]');if(button)catalogPicker.remove(button.dataset.removeIngredient);});
document.addEventListener('app:datachange',renderCatalog);
renderCatalog();
