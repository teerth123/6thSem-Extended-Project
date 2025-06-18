import { useState } from "react"

export default function Login(){
    const [username, setUsername] = useState("")
   
    const [firstname, setfirstname] = useState("")
    const [lastname, setlastname] = useState("")
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [role, setrole] = useState("")
    const [yearsofExperience, setyearsofExperience] = useState(0)
    const [worksAt, setworksAt] = useState("")
    const [shortBio, setshortBio] = useState("")
    return(
        <>
            <form action=" " className="">
                <input type="text" placeholder="enter username" required="true" onChange={(e)=>{setUsername(e.target.value)}}/>
                <input type="text" placeholder="enter firstname" onChange={(e)=>{setfirstname(e.target.value)}}/>
                <input type="text" placeholder="enter lastname" onChange={(e)=>{setlastname(e.target.value)}}/>
                <input type="text" placeholder="enter email" onChange={(e)=>{setemail(e.target.value)}}/>
                <input type="text" placeholder="enter password" onChange={(e)=>{setpassword(e.target.value)}}/>
                <input type="text" placeholder="enter role" onChange={(e)=>{setrole(e.target.value)}}/>
                <input type="text" placeholder="enter years of Exp" onChange={(e)=>{setyearsofExperience(e.target.value)}}/>
                <input type="text" placeholder="where do you works at" onChange={(e)=>{setworksAt(e.target.value)}}/>
                <input type="text" placeholder="bio" onChange={(e)=>{setshortBio(e.target.value)}}/>
                <button>subimt</button>

            </form>
        </>
    )
}