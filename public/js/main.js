$(function(){
	ClassicEditor.create(document.querySelector('#editor'))
	.catch(error=>{
		console.error(error);
	});
	$('a.confirmDeletion').click(function(){
		if (!confirm('apakah anda yakin ingin menghapus ini')) {
			return false;
		}
	});
	$('a.confirmDeletionCat').click(function(){
		if (!confirm('apakah anda yakin ingin menghapus Categories ini')) {
			return false;
		}
	});
});