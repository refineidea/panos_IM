
let vm = new Vue({
    el:"#msg-board",
    data:{
        onlinenums:0,
        writingstatus:false,
        msgboardstatus:false,
        zanboardstatus:false,
        istada:false,
        user:{},  //登录用户信息
        text:'',  //留言
        msgdata:[],  //留言
        zandata:[],  //点赞
        loading:false,
        wholeview:{
            "show":false,
            "showimg":''
        },
        imgfile:null
    },
    mounted(){
        this.$nextTick(()=>{
            let selector = this.$refs.contentlist;
            this.scroll = new BScroll(selector,{
                click:true
            });
            
            this.dataView();
            this.getUserData();
            
        })
    },
    methods:{
        //获取历史数据，渲染初始页面，=>后台
        dataView(){
            //用户信息+留言
            $.get('../assets/data/data.json',(data)=>{
                this.msgdata=data.message;  
            });
            //用户点赞信息
            $.get('../assets/data/zan.json',(data)=>{
                this.zandata = data.message;
            });
            
        },
        //获取用户信息，昵称，头像 ,=>后台
        getUserData(){
            let whichuser = Math.round(Math.random());
            console.log(whichuser);
            if(whichuser > 0){
                $.get('../assets/data/me.json',(data)=>{
                    this.user = data.user;  //新用户
                });
            }
            else{
                $.get('../assets/data/me.json',(data)=>{
                    this.user = data.old;
                });
            }
            
        },
        sendData(){
            if(this.text == ''){
                alert("不能为空")
            }
            else{

                //data数据为当前登录用户数据
                let data = {
                    "id":this.user.id,   
                    "nickname":this.user.nickname,
                    "portrait":this.user.portrait,
                    "text":this.text
                }
                data = JSON.stringify(data);
               wsServer.send(data);

               this.text="";
               this.writingstatus=false;
            }
        },
        imgLoad(e){
            let _this = this;
            let file = this.$refs.imgload.files[0];
            var Orientation = null;
            EXIF.getData(file,function(){
                EXIF.getAllTags(this);
                Orientation = EXIF.getTag(this, 'Orientation'); 
                ImgRotate(Orientation);
                
            });
            var mpImg = new MegaPixImage(file);
            var resImg = document.createElement('img');

            //修复ios照片旋转问题，安卓没有此问题
            function ImgRotate(Orientation){
                if(navigator.userAgent.match(/iphone/i)){
                    console.log(Orientation);
                    if(Orientation !="" && Orientation != 'undefined'){
                        mpImg.render(resImg, { maxWidth: 800, maxHeight: 800, quality: 0.5,orientation:Orientation});
                    }
                    else{
                        mpImg.render(resImg, { maxWidth: 800, maxHeight: 800, quality: 0.5});
                    }
                }
                else{
                    mpImg.render(resImg, { maxWidth: 800, maxHeight: 800, quality: 0.5});
                }
            }
            
            
            setTimeout(()=>{
                
                this.imgfile = resImg.src;
                     let data = {
                        "id":this.user.id,   
                        "nickname":this.user.nickname,
                        "portrait":this.user.portrait,
                        "img":this.imgfile
                    };
                    this.loading = true;
                    data = JSON.stringify(data);
                    //模拟
                    wsServer.send(data);
                    //上传
                    // let formdata = new FormData();
                    // formdata.append("photo",base64ToBlob(resImg.src))
                    // $.ajax({
                    //     url: 'https://m.lmoar.com/api/wx/chat.json?page=0&roomId=10',
                    //     type: 'POST',
                    //     cache: false,
                    //     data: formData,
                    //     processData: false,
                    //     contentType: false
                    // }).done(function(data){
                    //     console.log(data)
                    // });
                    

            },300);

            // let reader = new FileReader();
            // reader.readAsDataURL(file);
            // reader.onload =(e)=>{
            //     this.imgfile = e.target.result;
            //     let data = {
            //         "id":this.user.id,   
            //         "nickname":this.user.nickname,
            //         "portrait":this.user.portrait,
            //         "img":this.imgfile
            //     };
            //     this.loading = true;
            //     data = JSON.stringify(data);
            //     wsServer.send(data);
            // };
            

        },
        //base64 to blob
        base64ToBlob(dataURI){
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], {type: mimeString});
        },
        //点击预览大图
        getImgView(e){
            this.wholeview.showimg = e.target.src;
            this.wholeview.show = true;

        },
        scrollToLastElement(vm){
            if(vm.scroll){
                vm.scroll.refresh();
                let toelement = vm.$refs.licontent.lastChild;
                vm.scroll.scrollToElement(toelement,500);

                console.log("scroll");
                
            };
        }
            
    },
    // updated(){
    //     if(this.scroll){
    //         this.scroll.refresh();
    //         let toelement = this.$refs.licontent.lastChild;
    //         this.scroll.scrollToElement(toelement,500);
            
    //     };
        
    // },
    filters:{
        onlineFilter(value){
            return "("+value+")";
        }
    }
});

let wsServer =new WebSocket('ws://192.168.191.1:8092');

wsServer.onopen = function(e){
    
};

wsServer.onmessage = function(e){
    vm.msgdata.push(JSON.parse(e.data));
    //console.log(vm.msgdata); 
    setTimeout(() => {
        vm.loading = false;
        vm.scrollToLastElement(vm);
    }, 500); 
    
}

//打开留言板
let openboard = function(){
    vm.msgboardstatus = true;
    setTimeout(() => {
        vm.scrollToLastElement(vm);
    }, 10);
}
