import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card, Result, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.renderFallback(this.state.error!, this.handleRetry);
    }
    return this.props.children;
  }

  renderFallback(error: Error, onRetry: () => void) {
    return (
      <Card style={{ margin: 24 }}>
        <Result
          status="error"
          title="Something went wrong"
          extra={
            <Button type="primary" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          <Paragraph>
            <Text code>{error.message}</Text>
          </Paragraph>
        </Result>
      </Card>
    );
  }
}
