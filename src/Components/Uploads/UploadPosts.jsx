import { LinearProgress, makeStyles } from "@material-ui/core"
import axios from "axios"
import { useEffect } from "react"
import { useRef, useState } from "react"
import { Redirect } from "react-router"
import {v4 as uuid} from "uuid"
import { loadData } from "../../Utils/localStorage"
import { Bios, ChooseFile, Container, OptionsSide, PostButtons, Preview, Wrapper } from "./uploadCss"

const useStyles = makeStyles((theme) => ({
    loader: {
      marginTop: theme.spacing(0.5),
    }
  }));

const UploadPosts = () => {

    const classes = useStyles();
    const [imgUrl, setImgUrl] = useState("")
    const [preview, setPreview] = useState(null)
    const [caption, setCaption] = useState("")
    const [state, setState] = useState(false)
    const [err, setErr] = useState(false)
    const [load, setLoad] = useState(false)
    const [typeofMedia, setTypeofMedia] = useState("")

    const imgRef = useRef()
    useEffect(() => {
        const endpoint = imgUrl?.name
        let ext = endpoint?.trim().split("").splice(endpoint.length-4).join("")
        let type = `${ext == '.mp4' ? 'video': 'image'}`
        setTypeofMedia(type)
    },[imgUrl])

    const showPreview = (e) => {
        setImgUrl(e.target.files[0])
        if(!imgRef.current.files[0]){
            return;
        }
        //for preview
        const img = URL.createObjectURL(imgRef.current.files[0])
        setPreview(img)
        setErr(false)
    }
    
    const postPicturToImgur = async () => {
        setLoad(true)
        const data = new FormData()
        data.append('file', imgUrl)
        data.append('upload_preset', 'Khushboo')
        

        await axios({
            method:"post",
            url: `https://api.cloudinary.com/v1_1/dbc71imie/${typeofMedia}/upload`,
            data:  data
        })
        .then((res) => postPictureToApi(res.data.secure_url))
        .catch((err) => setErr(true))

    }
    
    
    const postPictureToApi = (data) => {
        const userid = loadData("users").id

        const payload = {
            id: uuid(),
            userId: userid,
            imgSrc: data,
            caption: caption,
            likes: [],
            comments: [],
            dateCreation: Date.now()
        }
        axios.post("https://json-server-mocker-neeraj-data.herokuapp.com/instaPosts", payload)
        .then((res) => setState(true))
        .catch((err) => console.log(err))
        setLoad(false)
    }
    if(state){
        return <Redirect exact push to="/"/>
    }

    return (
        <>
        <Wrapper>
            {load && <LinearProgress className={classes.loader} />}
            <Container>
                <ChooseFile
                ref={imgRef}
                type="file"
                onChange={showPreview}
                />
                <OptionsSide>
                    <h1>Add New Post</h1>
                    <h4>Cover</h4>
                    <p>Must be a JPG or PNG file. The minimum recommended size is 492 x 762 pixels.</p>
                    <Preview>
                        {
                            preview && typeofMedia == 'image' ?
                            
                            (<img src={preview} alt="preview" width="100%" height="100%"/>) : 
                            (<video src={preview} width="100%" height="100%"></video>)
                        }
                    </Preview>
                    {err && <p>Oops!. Failed in Loading the Image. Please try again.</p>}
                    <button>Edit</button>
                    <h4>Details</h4>
                    <Bios placeholder="Add a Caption" type="text"
                    onChange={(e) => setCaption(e.target.value)}
                    />
                    <br/><br/>
                    <PostButtons>
                        <button onClick={postPicturToImgur}>POST</button>
                        <h5>Save Draft</h5>
                    </PostButtons>
                </OptionsSide>
            </Container>
        </Wrapper>
        </>
    )
}

export {UploadPosts}


