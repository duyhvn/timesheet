package jfang.project.timesheet.web.dto;

/**
 * Created by jfang on 1/23/16.
 */
public class NewProjectDto {

    private String projectName;

    private String startDate;

    private String endDate;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
