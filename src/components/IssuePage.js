import { Card, List, Tag, Tooltip, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DotInCircleIcon } from "./Header";
import Icon from "@ant-design/icons";
import moment from "moment";
const { Text } = Typography;

const GreenDotSVG = () => (
  <svg
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
    <path
      d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
    ></path>
  </svg>
);

export const GreenDotIcon = (props) => (
  <Icon component={GreenDotSVG} {...props} />
);
const IssuePage = () => {
  const [issues, setIssues] = useState([]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prevY, setPrevY] = useState(0);

  let loadingRef = useRef(null);
  let prevYRef = useRef({});
  let issuesRef = useRef({});
  let pageRef = useRef({});

  prevYRef.current = prevY;
  issuesRef.current = issues;
  pageRef.current = page;

  const getParsedBadgeData = (badges) => {
    const parsedBadges = badges.map((badge) => {
      let parsedBadge = {};
      parsedBadge["color"] = badge?.color;
      parsedBadge["description"] = badge?.description;
      parsedBadge["name"] = badge?.name;
      parsedBadge["url"] = badge?.url;
      return parsedBadge;
    });
    return parsedBadges;
  };

  const getParsedData = (dataFromAPI) => {
    const temp = dataFromAPI.map((issue) => {
      let tempObj = {};
      tempObj["url"] = issue?.html_url;
      tempObj["title"] = issue?.title;
      tempObj["tags"] = getParsedBadgeData(issue?.labels);
      tempObj["number"] = issue?.number;
      tempObj["created_at"] = issue?.created_at;
      tempObj["userURL"] = issue?.user?.html_url;
      tempObj["userName"] = issue?.user?.login;
      return tempObj;
    });
    setIssues(temp);
  };

  const getGitHubIssues = async () => {
    const response = await fetch(
      `https://api.github.com/repos/facebook/react/issues?page=${pageRef.current}`
    );
    const dataFromAPI = await response.json();
    getParsedData(dataFromAPI);
  };

  useEffect(() => {
    getGitHubIssues();
    setPage(pageRef.current + 1);

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    observer.observe(loadingRef.current);
  }, []);

  const handleObserver = (entities, observer) => {
    const y = entities[0].boundingClientRect.y;
    if (prevYRef.current > y) {
      getGitHubIssues();
      setPage(pageRef.current + 1);
    }
    setPrevY(y);
  };

  return (
    <Card
      title={
        <>
          <DotInCircleIcon style={{ color: "hotpink" }} />
          625 Open
        </>
      }
      size={"small"}
      style={{ width: "80%", margin: "0 auto" }}
    >
      <List
        itemLayout="horizontal"
        dataSource={issues}
        renderItem={(issue) => {
          let date = moment(issue.created_at, "YYYY-MM-DD");
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<GreenDotIcon />}
                title={
                  <div style={{ maxWidth: "68%" }}>
                    <a
                      href={issue.url}
                      target={"_blank"}
                      rel="noreferrer"
                      style={{
                        color: "#000",
                        textDecoration: "none !important",
                      }}
                    >
                      {issue.title}
                    </a>
                    {issue?.tags.map((tag, index) => {
                      return (
                        <Tooltip
                          title={tag.description}
                          placement="bottomLeft"
                          arrowPointAtCenter
                          key={tag.name}
                        >
                          <Tag
                            color={`#${tag.color}`}
                            style={{
                              borderRadius: "10px",
                              color: "#000",
                              fontWeight: 600,
                            }}
                          >
                            <Text strong>{tag.name}</Text>
                          </Tag>
                        </Tooltip>
                      );
                    })}
                  </div>
                }
                description={
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {`#${issue.number}`} {`opened ${date.fromNow()} ago by `}{" "}
                    <Tooltip
                      title={`open issues created by ${issue.userName}`}
                      placement="bottomLeft"
                      arrowPointAtCenter
                    >
                      <a
                        href={issue.userURL}
                        target={"_blank"}
                        rel="noreferrer"
                        style={{
                          color: "rgba(0, 0, 0, 0.45)",
                          textDecoration: "none !important",
                        }}
                      >
                        {issue.userName}
                      </a>
                    </Tooltip>
                  </Text>
                }
              />
            </List.Item>
          );
        }}
      />
      <div ref={loadingRef} />
      {loading && <div>Loading</div>}
    </Card>
  );
};

export default IssuePage;
