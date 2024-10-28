import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import BlogList from "../../components/BlogList";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import AddEditBlogModal from "../../components/AddEditBlogModal";
import DeleteBlogModal from "../../components/DeleteBlogModal";
import SuccessToast from "../../components/SuccessToast";
import ErrorToast from "../../components/ErrorToast";

import blogService from "../../services/blogService";
import authService from "../../services/authService";

export default function ProfilePage() {
  const { authorId } = useParams();

  const [author, setAuthor] = useState();
  const [blogs, setBlogs] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchAuthorBlogs = async () => {
      try {
        setIsLoading(true);
        const author = await authService.getUser(authorId);
        const blogs = await blogService.fetchBlogsByAuthorId(authorId);
        setBlogs(blogs.data);
        setAuthor(author.data);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        setMessage(error.message || error);
      }
    };
    fetchAuthorBlogs();
  }, [authorId]);

  const resetSuccess = () => {
    setIsSuccess(false);
    setMessage("");
  };

  const resetError = () => {
    setIsError(false);
    setMessage("");
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAuthor((prevAuthor) => ({ ...prevAuthor, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("image", selectedImage);

        const updatedAuthor = await authService.updateUserImage(authorId, formData);
        setAuthor(updatedAuthor.data);
        setIsLoading(false);
        setIsSuccess(true);
        setMessage("Profile picture updated successfully!");
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        setMessage(error.message || error);
      }
    }
  };

  const AuthorDetails = () => {
    return (
      <div className="col-md-8 col-lg-6 col-xl-4 mx-auto">
        <div className="position-sticky my-5" style={{ top: "2rem" }}>
          <div className="p-4 mb-3 bg-light rounded">
            <h4 className="fst-italic">
              {author.firstName} {author.lastName}
            </h4>
            <img src={`http://localhost:8000${author.image}`} className="avatar" alt="..." />
            <p>{author.bio.substring(0, 100)}...</p>
            <input type="file" onChange={handleImageChange} />
            {selectedImage && (
              <button onClick={handleImageUpload} className="btn btn-primary mt-2">
                Upload New Profile Picture
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || !author || !blogs) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <AuthorDetails />
        <p className="page-subtitle">Author Blog Posts</p>
        <BlogList blogs={blogs} />
        <Footer />
      </div>
      <AddEditBlogModal />
      <DeleteBlogModal />
      <SuccessToast show={isSuccess} message={message} onClose={resetSuccess} />
      <ErrorToast show={isError} message={message} onClose={resetError} />
    </>
  );
}
