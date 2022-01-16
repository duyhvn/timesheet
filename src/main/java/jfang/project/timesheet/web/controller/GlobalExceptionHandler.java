package jfang.project.timesheet.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ModelAndView handleError(HttpServletRequest req, Exception exception) {
        logger.error("Request: " + req.getRequestURL(), exception);

        ModelAndView modelAndView = new ModelAndView("error");
        modelAndView.addObject("errorCode", "500");
        modelAndView.addObject("errorMessage", exception.getMessage());
        modelAndView.addObject("errorReq", req.getRequestURL());
        
        return modelAndView;
    }
}
