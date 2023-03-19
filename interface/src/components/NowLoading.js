import React from "react";

const NowLoading = () => {
  return (
    <>
      <tr>
        <td colSpan="5">
          <div
            className="progress"
            role="progressbar"
            aria-label="Success striped example"
            aria-valuenow="25"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-bar progress-bar-striped bg-dark w-50"
            ></div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default NowLoading;
