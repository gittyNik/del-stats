import Express from 'express';
import {insert,select,insertImage} from '../controllers/link.controller';
import multer from 'multer';

const router = Express.Router();

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename:function(req,file,cb){
        cb(null, file.originalname);
    }
});

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' ||file.mimetype==='image/png'){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
    
}
const upload=multer({storage:storage,limits:{
    fileSize:1024*1024*5
},
fileFilter:fileFilter
});

router.post('/:uid/:topic/:url', insert);
router.get('/:topic', select);
router.post('/:uid/:topic', upload.single('image'),insertImage);


export default router;