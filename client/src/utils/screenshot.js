import { updateScreenshot } from "../redux/screenshotSlice";

// take screenshot for info panel
export const takeScreenshot = (
  view,
  mapPoint,
  dispatch,
  withMarker = false
) => {
  const screenPoint = view.toScreen(mapPoint);
  const width = 1000;
  const height = 500;

  if (withMarker) {
    view
      .takeScreenshot({
        area: {
          x: screenPoint.x - width / 2,
          y: screenPoint.y - height / 2,
          width: width,
          height: height,
        },
      })
      .then((screenshot) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        const img = new Image();
        img.width = width;
        img.height = height;
        img.src = screenshot.dataUrl;

        img.onload = () => {
          context.drawImage(img, 0, 0);
          context.strokeStyle = "#4090D0";
          context.lineWidth = 10;
          context.beginPath();
          context.moveTo(width / 2, height / 2);
          context.lineTo(width / 2 + 10, height / 2 - 40);
          context.lineTo(width / 2 - 10, height / 2 - 40);
          context.closePath();
          context.stroke();

          dispatch(updateScreenshot(canvas.toDataURL()));
        };
      });
  } else {
    view
      .takeScreenshot({
        area: {
          x: screenPoint.x - width / 2,
          y: screenPoint.y - height / 2,
          width: width,
          height: height,
        },
      })
      .then((screenshot) => {
        dispatch(updateScreenshot(screenshot.dataUrl));
      });
  }
};
