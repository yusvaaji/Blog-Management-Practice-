import React, { useState, useEffect } from "react";
import axios from "axios";
// React Hooks : React Lifecycle akan berjalan ketika component di execute
// REact Hooks : useState, useEffect

import NowLoading from './NowLoading'

const Post = () => {
    const [posts, setPosts] = useState([]);
    const URL = "http://localhost:4300/api"

    // Form
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [search_vector, setSearh_vector] = useState("")
    const [author, setAuthor] = useState("")

    const getPosts = async () => {
        try {
            let temp = await axios({
                url: `${URL}/posts`,
                method: "GET",
            })
            console.log(temp.data)
            setPosts(temp.data)
        } catch (err) {
            alert(err)
        }
    }
    const addPost = async () => {
        try {
            let result = await axios({
                url: `${URL}/posts/store`,
                method: "POST",
                data: {
                    title, title,
                    body: body,
                    search_vector: search_vector,
                    author: author,
                    UserId: 1
                }
            })
            getPosts()

            setTitle("")
            setBody("")
            setSearh_vector("")
            setAuthor("")
        } catch (err) {
            alert(err)
        }
    }
    const submitHandler = (e) => {
        e.preventDefault()
        addPost()
    }

    useEffect(() => {
     
        getPosts()

    }, [])


    return (
        <div className="container">
            <div className="row text-center">
                <h3 className="">Post Page</h3>
                <p>Add your post</p>
                <hr />
            </div>
            {/* <button
                className="btn btn-sm btn-outline-success my-3"
                onClick={getProductHandler}
            >
                GET PRODUCTS
            </button> */}
            <div className="row">
                <div className="col-4 form-submit">
                    <form>
                        <div className="mb-3">
                            <label>Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                type="text"
                                className="form-control"
                                placeholder="Input Title" />
                        </div>
                        <div className="mb-3">
                            <label>Body</label>
                            <input
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                type="text"
                                className="form-control"
                                placeholder="Input Body" />
                        </div>
                        <div className="mb-3">
                            <label>Author</label>
                            <input
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                                type="text"
                                className="form-control"
                                placeholder="Input Author" />
                        </div>
                        {/* <div className="mb-3">
                            <label>Stock</label>
                            <input
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                type="text"
                                className="form-control"
                                placeholder="Input Stock" />
                        </div> */}
                        <div className="mb-3">
                            <label>Users</label>
                            <select className="form-select">
                                <option value="1">grafikadmin@finalblog.com</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <button
                                className="btn btn-success w-100"
                                onClick={submitHandler}
                            >Submit Post</button>
                        </div>
                    </form>
                </div>
                <div className="col-8">
                    <table className="table table-bordered border-dark">
                        <thead>
                            <tr>
                                <th>Post</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length !== 0 ?
                                posts.map((product) => {
                                    const { id, title, body, author,search_vector,User } = product;
                                    return (
                                        <tr key={id}>
                                            <td>
                                                <div className="row">
                                                    <div className="col-3">
                                                        {/* <img className="img-fluid" src={image}/> */}
                                                        <h3 className="text-success">{title}</h3>
                                                    </div>
                                                    <div className="col-9">
                                                        <h3 className="text-success">{author}</h3>
                                                        <h5 className="text-primary">{body}</h5>
                                                        <p> {body}</p>
                                                        <small className="badge bg-success">{User.username}</small>
                                                       
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-danger">Remove</button>
                                                <button className="btn btn-sm btn-info">Edit</button>
                                            </td>
                                        </tr>
                                    );
                                }) :
                                <NowLoading />
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Post;
