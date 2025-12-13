import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/dashboard');
    };

    return (
        <div className="animate-fade-in">
            <HeroSection onStart={handleStart} />
            <FeaturesSection />
        </div>
    );
}