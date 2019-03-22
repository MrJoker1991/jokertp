$(function () {
    tags.getTags('');
    $(document).on(".labeltype",'mouseover', function () {
        $(this).find('.label-type-text').css('display', 'none');
        $(this).find('.label-type-delete').css('display', 'block');
    }).on(".labeltype",'mouseleave', function () {
        $(this).find('.label-type-text').css('display', 'block');
        $(this).find('.label-type-delete').css('display', 'none');
    });    
});

function showTagsView(){
    $('#hdj-edit-tags').show().siblings().hide();
}

var adminPageSkip = {
    openOrganizerManage:function(){
        window.open("/Organizer/index/");
    }
};



