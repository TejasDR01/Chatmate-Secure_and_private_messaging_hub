import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import $ from "jquery";
import { Signin,Signup } from "../api/api.js";
const Auth = ()=>{
    const initialState={usrnm:"", email:"", pass:"", cpass:""};
    const navigate = useNavigate();
    const [formData, setformData] = useState(initialState);
    const [isSingup, setisSignup] = useState(false);

    const handleSignUp=(e)=>{
        setisSignup(true);
        setformData(initialState);
        $(".t2").css("background", "none");
        $(".t2").css("border-bottom", "none");
		$(".t1").css("background", "rgba(255, 0, 128, 0.842)");
        $(".t1").css("border-bottom", "2px solid rgb(228, 223, 223)");
        $("#msg").hide();
    };
    const handleSignIn=(e)=>{
        setisSignup(false);
        setformData(initialState); 
        $(".t1").css("background", "none");
        $(".t1").css("border-bottom", "none");
		$(".t2").css("background", "rgba(255, 0, 128, 0.842)");
        $(".t2").css("border-bottom", "2px solid rgb(228, 223, 223)");
        $("#msg").hide();
    };
    const handleSubmit= async (e)=>{
        e.preventDefault();
        if(isSingup){
            if(formData["usrnm"].length<5){
                console.log("hi");
                $("#msg").text("Username requires min 5 chars");
                $("#msg").show();
            }
            else if(formData["pass"].length<=7){
                $("#msg").text("Password requires min 8 chars");
                $("#msg").show();
            }
            else if (formData["pass"]!==formData["cpass"]){
                $("#msg").text("Passwords not matched !!");
                $("#msg").show();
            }
            else{
                try{
                    const res = await Signup(formData);
                    if(res.status===200){
                        localStorage.setItem("profile",JSON.stringify(res.data));
                        navigate("/");
                        alert("account created successfully!");
                    }
                    else{
                        if(res.status===201){
                            $("#msg").text(res.data.message);
                            $("#msg").show();
                        }
                        else{
                            console.log(res);
                        }
                    }
                }catch(error){
                    console.log({message: error.message});
                }
            }
        }
        else{
            try{
                const res = await Signin(formData);
                if(res.status===200){
                    //console.log(res.data);
                    localStorage.setItem("profile",JSON.stringify(res.data));
                    navigate("/");
                }
                else{
                    console.log(res);
                }
            }catch(error){
                if(error.response && error.response.status===404){
                    $("#msg").text(error.response.data.message);
                    $("#msg").show();
                }
                else
                    console.log({message: error.message});
            }
        }
        e.target.reset();
        setformData(initialState);
    };
    const handleChange =(e)=>{setformData({...formData, [e.target.name]:e.target.value});};

    return(
        <div className="s0">
        <div className="s1">
            <div className="s2"> 
                <button className="t1" onClick={handleSignIn}>Sign In</button>
                <button className="t2" onClick={handleSignUp}>Sign Up</button>
            </div>
            <form className="s3" onSubmit={handleSubmit}>
                {isSingup && (<input type="text" placeholder="Username" name="usrnm" required onChange={handleChange} value={formData.usrnm}/>)}
                <input type="email" placeholder="email" name="email" onChange={handleChange} value={formData.email}/>
                <input type="password" placeholder="Password"  name="pass" id="pas2" required onChange={handleChange} value={formData.pass}/>
                {isSingup && (<input type="password" placeholder="Confirm Password"  name="cpass" required onChange={handleChange} value={formData.cpass}/>)}
                <input type="submit" className="j" value={isSingup ? "Register" : "Sign in" }/>
            </form>
            <b><p id="msg"></p></b>
        </div>
        </div>
    );
}

export default Auth;