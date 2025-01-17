import { useState, useEffect } from "react";
import LessonService from "../../services/lesson.service";
import { Link, useParams } from "react-router-dom";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import { toast } from "react-hot-toast";
import axios from "axios";

const ListLesson = () => {
  const [titleUnit, setTitleUnit] = useState("");
  const [lessons, setLessons] = useState([]);
  const [userActive, setUser] = useState(undefined);
  const { unitId } = useParams();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    LessonService.getLessons(unitId).then((response) => {
      setLessons(response.data.lessons);
      setTitleUnit(response.data.title);
    });
  }, [lessons]);

  const canAccessLesson = (lessonIndex) => {
    if (lessonIndex === 0) {
      return true;
    }

    const previousLesson = lessons[lessonIndex - 1];

    const userCompletion = previousLesson.completedByUsers.find(
      (user) => user.userId === userActive.id
    );

    return userCompletion && userCompletion.completed;
  };

  // Fungsi untuk memeriksa apakah semua pelajaran telah selesai
  const allLessonsCompleted = () => {
    return lessons.every((lesson) => {
      const userCompletion = lesson.completedByUsers.find(
        (user) => user.userId === userActive.id
      );
      return userCompletion && userCompletion.completed;
    });
  };

  const allFinished = async () => {
    // fetch badge
    try {
      if (userActive && userActive.id) {
        axios
          .post(
            `http://localhost:5000/api/${userActive.id}/badge/add`,
            { unitId: unitId, badgeName: titleUnit },
            { headers: authHeader() }
          )
          .then((response) => {
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
      } else {
        toast.error("Anda sudah menambahkan badge sebelumnya.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col">
      {lessons.map((lesson, index) => {
        const canAccess = canAccessLesson(index);

        return (
          <div
            key={lesson._id}
            className={`p-2 my-2 bg-white shadow-md font-medium rounded-md ${canAccess ? "" : "opacity-50"}`}
          >
            {canAccess ? (
              <Link className="flex justify-start items-center" to={lesson._id}>
                <img
                  src={lesson.images}
                  className="w-[3rem] rounded-full mr-2"
                  alt="lesson"
                />
                <h1>{lesson.title}</h1>
              </Link>
            ) : (
              <p>
                Anda harus menyelesaikan pelajaran sebelumnya terlebih dahulu
              </p>
            )}
          </div>
        );
      })}

      {lessons.length > 0 && (
        <button
          className="bg-accent text-primary rounded-md font-medium px-4 py-2"
          onClick={allFinished}
          disabled={!allLessonsCompleted()}
        >
          Selesai
        </button>
      )}
    </div>
  );
};

export default ListLesson;
